import { Model, Schema, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import type {
    Ticket as TicketType,
    TicketDoc as TicketDocType,
} from "@ksoftdev/core";
import {
    BadRequestError,
    NotFoundError,
    UnAuthorizedError,
} from "@ksoftdev/core";

export interface Ticket extends TicketType {
    orderId?: string;
}

export interface TicketDoc extends TicketDocType {
    orderId?: string;
}

interface TicketFunctions {
    newTicket(ticket: Ticket): Promise<TicketDoc>;
    checkTicket(ticket: Ticket): Promise<void>;
    updateTicket: (ticketId: string, payload: Ticket) => Promise<TicketDoc>;
}

const ticketSchema = new Schema<TicketDoc>(
    {
        title: { type: String, required: true },
        userId: { type: String, required: true },
        price: { type: Number, required: true },
        orderId: { type: String },
    },
    {
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
        timestamps: true,
    },
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.static("newTicket", async (ticket: Ticket) => {
    const { title, price, userId } = ticket;

    const createdTicket = await new TicketModel({
        title,
        price,
        userId,
    });

    await createdTicket.save();
    return createdTicket;
});

ticketSchema.static("checkTicket", async (ticket: Ticket) => {
    const { title, userId } = ticket;

    const ticketExists = await TicketModel.findOne({ title, userId });

    if (ticketExists && ticketExists.orderId)
        throw new BadRequestError("tickets already added!");
});

ticketSchema.static(
    "updateTicket",
    async (ticketId: string, ticketParam: Ticket) => {
        const { title, price, userId } = ticketParam;

        const ticket = await TicketModel.findById(ticketId);

        if (!ticket) throw new NotFoundError(`ticket ${ticketId} not found`);

        const isCurrentUserTicket = ticket?.userId === userId;
        if (!isCurrentUserTicket)
            throw new UnAuthorizedError(
                "Your are not authorize to update the ticket",
            );

        if (ticket.orderId)
            throw new BadRequestError("Cannot edit a reserved ticket");

        // const titleExists = await TicketModel.findOne({ userId, title })
        //     .where("_id")
        //     .ne(ticket.id);

        // if (titleExists)
        //     throw new BadRequestError("tickets already purchased!");

        ticket.set({ title, price });
        await ticket.save();

        const updatedTicket = await TicketModel.findById(ticketId);

        return updatedTicket;
    },
);

const TicketModel = model<TicketDoc, Model<TicketDoc> & TicketFunctions>(
    "Ticket",
    ticketSchema,
);

export default TicketModel;
