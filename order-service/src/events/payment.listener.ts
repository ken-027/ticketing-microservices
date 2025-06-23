import {
    Listener,
    NotFoundError,
    OrderStatus,
    PaymentCreatedEvent,
    Subjects,
} from "@ksoftdev/core";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../config/events";
import OrderModel from "../models/order.model";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: PaymentCreatedEvent["data"], message: Message) {
        const { orderId } = data;

        const order = await OrderModel.findById(orderId);

        if (!order) throw new NotFoundError("order not found");

        order.set({
            status: OrderStatus.Complete,
        });
        await order.save();

        message.ack();
    }
}
