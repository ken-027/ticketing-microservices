import { Model, Schema, model } from "mongoose";
import type {
    Ticket as TicketType,
    TicketDoc as TicketDocType,
} from "@ksoftdev/core";
import { BadRequestError, NotFoundError, OrderStatus } from "@ksoftdev/core";
import OrderModel from "./order.model";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

type Ticket = TicketType & { id: string };

interface TicketFunctions {
    newTicket(ticket: Ticket): Promise<TicketDoc>;
    updateTicket: (ticketId: string, payload: Ticket) => Promise<TicketDoc>;
    findPreviousVersion: (
        id: string,
        version: number,
    ) => Promise<TicketDoc | null>;
}

export interface TicketDoc extends TicketDocType {
    validateInOrder(): Promise<void>;
}

const ticketSchema = new Schema<TicketDoc>(
    {
        title: { type: String, required: true },
        price: { type: Number, required: true },
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

ticketSchema.static("newTicket", async (ticket: Ticket) => {
    const { title, price, id, userId } = ticket;

    const createdTicket = await new TicketModel({
        title,
        price,
        userId,
        _id: id,
    });

    await createdTicket.save();
    return createdTicket;
});
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.method("validateInOrder", async function () {
    const existingOrder = await OrderModel.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete,
            ],
        },
    });

    if (existingOrder) throw new BadRequestError("Ticket is already reserved");
});

ticketSchema.static(
    "findPreviousVersion",
    async function (id: string, version: number) {
        const ticket = await TicketModel.findOne({
            _id: id,
            version: version - 1,
        });

        return ticket;
    },
);

ticketSchema.static(
    "updateTicket",
    async (ticketId: string, ticketParam: Ticket) => {
        const { title, price } = ticketParam;

        const ticket = await TicketModel.findById(ticketId);

        if (!ticket) throw new NotFoundError(`ticket not found`);

        // const titleExists = await TicketModel.findOne({ title })
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
