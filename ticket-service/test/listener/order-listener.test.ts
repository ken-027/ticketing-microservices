import {
    OrderCancelledEvent,
    OrderCreatedEvent,
    OrderStatus,
} from "@ksoftdev/core";
import natsWrapper from "../../__mocks__/nats-wrapper.mock";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import TicketModel from "../../src/models/ticket.model";
import {
    OrderCancelledListener,
    OrderCreatedListener,
} from "../../src/events/order.listener";

beforeEach(() => {
    jest.clearAllMocks();
});

const createdListener = async () => {
    // @ts-ignore
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = await TicketModel.newTicket({
        title: "Pacers vs Thunder Game 7",
        price: 130,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    const orderId = new mongoose.Types.ObjectId().toHexString();

    const data: OrderCreatedEvent["data"] = {
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        version: 0,
        id: orderId,
        userId: ticket.userId,
        ticket: {
            id: ticket.id,
            price: ticket.price,
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

    const ticket = await TicketModel.newTicket({
        title: "Pacers vs Thunder Game 7",
        price: 130,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });
    ticket.orderId = orderId;
    await ticket.save();

    const data: OrderCancelledEvent["data"] = {
        version: 0,
        id: orderId,
        ticket: {
            id: ticket.id,
        },
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, data, message };
};

describe("Event listeners", () => {
    describe("create orders", () => {
        it("publish a ticket updated event", async () => {
            const { listener, message, data } = await createdListener();

            await listener.onMessage(data, message);

            expect(natsWrapper.client.publish).toHaveBeenCalled();

            const eventData = JSON.parse(
                natsWrapper.client.publish.mock.calls[0][1],
            );

            expect(data.id).toEqual(eventData.payload.orderId);
        });

        it("should listen on order created event", async () => {
            const { listener, message, data } = await createdListener();

            await listener.onMessage(data, message);

            const ticket = await TicketModel.findById(data.ticket.id);

            expect(ticket).toBeDefined();
            expect(ticket!.orderId).toEqual(data.id);
        });

        it("acknowledge the created event message", async () => {
            const { listener, message, data } = await createdListener();

            await listener.onMessage(data, message);

            expect(message.ack).toHaveBeenCalled();
        });
    });

    describe("cancelled order", () => {
        it("should listen on order cancelled event", async () => {
            const { listener, message, data } = await cancelledListener();

            await listener.onMessage(data, message);

            const ticket = await TicketModel.findById(data.ticket.id);

            expect(ticket).toBeDefined();
            expect(ticket!.orderId).toBeUndefined();
        });

        it("acknowledge the cancelled event message", async () => {
            const { listener, message, data } = await cancelledListener();

            await listener.onMessage(data, message);

            expect(message.ack).toHaveBeenCalled();
        });

        it("publish a ticket cancelled event", async () => {
            const { listener, message, data } = await cancelledListener();

            await listener.onMessage(data, message);

            expect(natsWrapper.client.publish).toHaveBeenCalled();

            const eventData = JSON.parse(
                natsWrapper.client.publish.mock.calls[0][1],
            );

            expect(eventData.payload.orderId).toBeUndefined();
        });
    });
});
