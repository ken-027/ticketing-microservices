import {
    OrderCancelledEvent,
    OrderCreatedEvent,
    OrderStatus,
} from "@ksoftdev/core";
import natsWrapper from "../../__mocks__/nats-wrapper.mock";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import {
    OrderCancelledListener,
    OrderCreatedListener,
} from "../../src/events/order.listener";
import OrderPaymentModel from "../../src/models/order-payment.model";

const createdListener = async () => {
    // @ts-ignore
    const listener = new OrderCreatedListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const data: OrderCreatedEvent["data"] = {
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        version: 0,
        id: orderId,
        userId,
        ticket: {
            id: ticketId,
            price: 30,
        },
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, data, message };
};

const cancelledListener = async () => {
    // @ts-ignore
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const orderPayment = await OrderPaymentModel.newOrder({
        id: orderId,
        version: 0,
        status: OrderStatus.Created,
        price: 30,
        userId,
    });


    const data: OrderCancelledEvent["data"] = {
        version: orderPayment.version + 1,
        id: orderPayment.id,
        ticket: {
            id: ticketId,
        },
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, data, message };
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Event listeners", () => {
    describe("create orders", () => {
        it("replicates the order info", async () => {
            const { data, listener, message } = await createdListener();

            await listener.onMessage(data, message);

            const orderPayment = await OrderPaymentModel.findById(data.id);

            expect(orderPayment).toBeDefined();
            expect(orderPayment!.status).toEqual(data.status);
            expect(orderPayment!.price).toEqual(data.ticket.price);
            expect(orderPayment!.version).toEqual(data.version);
        });

        it("acknowledge the message", async () => {
            const { data, listener, message } = await createdListener();

            await listener.onMessage(data, message);

            expect(message.ack).toHaveBeenCalled();
        });
    });

    describe("cancelled order", () => {
        it("updates the status of the order", async () => {
            const { data, listener, message } = await cancelledListener();

            await listener.onMessage(data, message);

            const orderPayment = await OrderPaymentModel.findById(data.id);

            expect(orderPayment).toBeDefined();
            expect(orderPayment!.status).toEqual(OrderStatus.Cancelled);
        });

        it("acknowledge the message", async () => {
            const { data, listener, message } = await cancelledListener();

            await listener.onMessage(data, message);

            expect(message.ack).toHaveBeenCalled();
        });
    });
});
