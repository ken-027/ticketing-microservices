import natsWrapper from "../__mocks__/nats-wrapper.mock";

jest.mock("@ksoftdev/core", () => {
    const originalModule = jest.requireActual("@ksoftdev/core");

    return {
        __esModule: true,
        ...originalModule,
        natsWrapper,
    };
});

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { JWT, OrderDoc, OrderStatus, User } from "@ksoftdev/core";
import TicketModel, { TicketDoc } from "../src/models/ticket.model";
import OrderModel from "../src/models/order.model";

let mongo: MongoMemoryServer;

type Ticket = Pick<
    TicketDoc,
    "id" | "title" | "price" | "createdAt" | "updatedAt" | "userId"
>;

declare global {
    var signin: (credential?: Omit<User, "password">) => string;
    var email: string;
    var title: string;
    var id: string;
    var ticketId: string;
    var price: number;
    var createOrder: (
        ticket: Pick<Ticket, "title" | "price" | "userId" | "id">,
    ) => Promise<{ order: OrderDoc; ticket: TicketDoc }>;
}

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    const collections = await mongoose.connection.db?.collections();

    if (!collections) {
        console.error("no collections found!");
        return;
    }

    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.email = "test@example.com";
global.title = "Pacers vs Thunder G1";
global.id = new mongoose.Types.ObjectId().toHexString();
global.price = 5_014;
global.ticketId = new mongoose.Types.ObjectId().toHexString();

global.signin = (user) => {
    const token = JWT.sign({
        email: user?.email || email,
        id: user?.id || id,
    });

    const session = { accessToken: token };
    const sessionJSON = JSON.stringify(session);
    const base64 = Buffer.from(sessionJSON).toString("base64");

    return `session=${base64};`;
};

global.createOrder = async (
    ticket: Pick<Ticket, "title" | "price" | "userId" | "id">,
) => {
    const { title, price, userId, id } = ticket;

    const _ticket = await TicketModel.newTicket({
        title,
        price,
        userId,
        id,
    });
    await _ticket.save();
    const order = await OrderModel.newOrder({
        ticket: _ticket,
        status: OrderStatus.Created,
        userId,
        expiresAt: new Date(),
    });
    await order.save();

    return { order, ticket: _ticket };
};
