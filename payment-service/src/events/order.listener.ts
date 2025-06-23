import {
    Listener,
    NotFoundError,
    OrderCancelledEvent,
    OrderCreatedEvent,
    OrderStatus,
    Subjects,
} from "@ksoftdev/core";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../config/events";
import OrderPaymentModel from "../models/order-payment.model";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCreatedEvent["data"], message: Message) {
        const {
            id,
            userId,
            status,
            version,
            ticket: { price },
        } = data;

        await OrderPaymentModel.newOrder({
            id,
            userId,
            status,
            version,
            price,
        });

        message.ack();
    }
}

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCancelledEvent["data"], message: Message) {
        const { id, version } = data;

        const orderPayment = await OrderPaymentModel.findPreviousVersion(
            id,
            version,
        );

        if (!orderPayment) throw new NotFoundError("order not found!");

        orderPayment.set({ status: OrderStatus.Cancelled });
        await orderPayment.save();

        message.ack();
    }
}
