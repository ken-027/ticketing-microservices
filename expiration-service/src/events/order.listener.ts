import {
    Listener,
    OrderCancelledEvent,
    OrderCreatedEvent,
    Subjects,
} from "@ksoftdev/core";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../config/events";
import { expirationQueue } from "../queues/expiration.queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCreatedEvent["data"], message: Message) {
        const { id: orderId, expiresAt } = data;
        const delay = new Date(expiresAt).getTime() - new Date().getTime();

        expirationQueue.add({ orderId }, { delay });
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

        console.log(id);

        message.ack();
    }
}
