import natsWrapper from "../../__mocks__/nats-wrapper.mock";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import TicketModel from "../../src/models/ticket.model";
import { ExpirationCompleteEvent, OrderStatus } from "@ksoftdev/core";
import OrderModel from "../../src/models/order.model";
import { ExpirationCompleteListener } from "../../src/events/expiration.listener";

const setup = async () => {
    // @ts-ignore
    const listener = new ExpirationCompleteListener(natsWrapper.client);
    const userId = new mongoose.Types.ObjectId().toHexString();

    const ticket = await TicketModel.newTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "Pacers vs Thunder Game 7",
        price: 300,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    const order = await OrderModel.newOrder({
        status: OrderStatus.Created,
        userId,
        expiresAt: new Date(),
        ticket,
    });

    const data: ExpirationCompleteEvent["data"] = {
        orderId: order.id,
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

describe("Expiration event listener", () => {
    it("updates the order status to cancelled", async () => {
        const { listener, data, message } = await setup();

        await listener.onMessage(data, message);

        const updatedOrder = await OrderModel.findById(data.orderId);
        expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
    });

    it("emit an OrderCancelled event", async () => {
        const { listener, data, message } = await setup();

        await listener.onMessage(data, message);

        expect(natsWrapper.client.publish).toHaveBeenCalled();

        const eventData = JSON.parse(
            natsWrapper.client.publish.mock.calls[0][1],
        );
        expect(eventData.id).toEqual(data.orderId);
    });
    it("ack the message", async () => {
        const { listener, data, message } = await setup();

        await listener.onMessage(data, message);

        expect(message.ack).toHaveBeenCalled();
    });
});
