import {
    Listener,
    NotFoundError,
    Subjects,
    TicketCreatedEvent,
    TicketUpdatedEvent,
} from "@ksoftdev/core";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../config/events";
import TicketModel from "../models/ticket.model";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: TicketCreatedEvent["data"], message: Message) {
        const { title, price, id, userId } = data;

        await TicketModel.newTicket({
            id,
            title,
            price,
            userId,
        });

        message.ack();
    }
}

export class TicketUpdateListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: TicketUpdatedEvent["data"], message: Message) {
        const {
            ticketId,
            payload: { title, price, version },
        } = data;

        const ticket = await TicketModel.findPreviousVersion(ticketId, version);
        if (!ticket) throw new NotFoundError("ticket not found!");

        ticket.set({ title, price });
        await ticket.save();

        message.ack();
    }
}
