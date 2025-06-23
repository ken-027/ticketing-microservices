import {
    Listener,
    NotFoundError,
    OrderCancelledEvent,
    OrderCreatedEvent,
    Subjects,
} from "@ksoftdev/core";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../config/events";
import TicketModel from "../models/ticket.model";
import { TicketUpdatedPublisher } from "./ticket.publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCreatedEvent["data"], message: Message) {
        const { id } = data;

        const ticket = await TicketModel.findById(data.ticket.id);

        if (!ticket) throw new NotFoundError("ticket not found");

        ticket.orderId = id;
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            ticketId: ticket.id,
            payload: {
                title: ticket.title,
                price: ticket.price,
                version: ticket.version,
                orderId: ticket.orderId,
                userId: ticket.userId,
            },
        });

        message.ack();
    }
}

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCancelledEvent["data"], message: Message) {
        const {
            ticket: { id },
        } = data;

        const ticket = await TicketModel.findById(id);

        if (!ticket) throw new NotFoundError("ticket not found");

        ticket.orderId = undefined;
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            ticketId: ticket.id,
            payload: {
                title: ticket.title,
                price: ticket.price,
                version: ticket.version,
                orderId: ticket.orderId,
                userId: ticket.userId,
            },
        });

        message.ack();
    }
}
