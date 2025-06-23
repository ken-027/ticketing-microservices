import {
    ExpirationCompleteEvent,
    Listener,
    NotFoundError,
    OrderStatus,
    Subjects,
} from "@ksoftdev/core";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../config/events";
import OrderModel from "../models/order.model";
import { OrderCancelledPublisher } from "./order.publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName: string = QUEUE_GROUP_NAME;

    async onMessage(data: ExpirationCompleteEvent["data"], message: Message) {
        const { orderId } = data;

        const order = await OrderModel.findById(orderId).populate("ticket");

        if (!order) throw new NotFoundError("order not found");

        if (order?.status === OrderStatus.Complete) return message.ack();

        order.set({
            status: OrderStatus.Cancelled,
        });
        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: orderId,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        message.ack();
    }
}
