import { TicketCreatedEvent, TicketUpdatedEvent } from "@ksoftdev/core";
import natsWrapper from "../../__mocks__/nats-wrapper.mock";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import TicketModel from "../../src/models/ticket.model";
import {
    TicketCreatedListener,
    TicketUpdateListener,
} from "../../src/events/ticket.listener";

const createdListener = async () => {
    // @ts-ignore
    const listener = new TicketCreatedListener(natsWrapper.client);

    const data: TicketCreatedEvent["data"] = {
        title: "Pacers vs Thunder Game 6",
        price: 15,
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, data, message };
};

const updatedListener = async () => {
    // @ts-ignore
    const listener = new TicketUpdateListener(natsWrapper.client);

    const ticket = await TicketModel.newTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Pacers vs Thunder Game 7",
        price: 30,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    const data: TicketUpdatedEvent["data"] = {
        ticketId: ticket.id,
        payload: {
            title: ticket.title,
            price: 35,
            userId: ticket.userId,
            version: ticket.version + 1,
        },
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, data, message };
};

describe("Ticket event listener", () => {
    it("should listen on ticket created event", async () => {
        const { listener, message, data } = await createdListener();

        await listener.onMessage(data, message);

        const ticket = await TicketModel.findById(data.id);

        expect(ticket).toBeDefined();
        expect(ticket!.title).toEqual(data.title);
        expect(ticket!.price).toEqual(data.price);
    });

    it("acknowledge the created event message", async () => {
        const { listener, message, data } = await createdListener();

        await listener.onMessage(data, message);

        expect(message.ack).toHaveBeenCalled();
    });

    it("should listen on ticket updated event", async () => {
        const { listener, message, data } = await updatedListener();

        await listener.onMessage(data, message);

        const ticket = await TicketModel.findById(data.ticketId);

        expect(ticket).toBeDefined();
        expect(ticket!.id).toEqual(data.ticketId);
        expect(ticket!.price).toEqual(data.payload.price);
    });

    it("acknowledge the updated event message", async () => {
        const { listener, message, data } = await updatedListener();

        await listener.onMessage(data, message);

        expect(message.ack).toHaveBeenCalled();
    });

    it("validate version for optimistic concurrency control", async () => {
        const { listener, message, data } = await updatedListener();

        data.payload.version = 3;
        try {
            await listener.onMessage(data, message);
        } catch (err) {}

        expect(message.ack).not.toHaveBeenCalled();
    });
});
