import request from "supertest";
import app from "../../../src/app";
import mongoose from "mongoose";
import TicketModel from "../../../src/models/ticket.model";
import natsWrapper from "../../../__mocks__/nats-wrapper.mock";

describe("Order create feature", () => {
    it("returns a non-404 status for POST /api/v1/orders (route handler exists)", async () => {
        const response = await request(app).post("/api/v1/orders").send({});

        expect(response.status).not.toEqual(404);
    });

    it("returns 401 if the user is not authenticated when creating an order", async () => {
        await request(app).post("/api/v1/orders").send().expect(401);
    });

    it("returns 400 if required fields are missing when creating an order", async () => {
        await request(app)
            .post("/api/v1/orders")
            .set("Cookie", signin())
            .send()
            .expect(400);
    });

    it("returns 400 if the provided ticketId is invalid when creating an order", async () => {
        await request(app)
            .post("/api/v1/orders")
            .set("Cookie", signin())
            .send({
                ticketId: "68529d865955ac40ee33497",
            })
            .expect(400);
    });

    it("returns 404 if the ticket does not exist when creating an order", async () => {
        const ticketId = new mongoose.Types.ObjectId().toHexString();
        const cookie = signin();

        await request(app)
            .post("/api/v1/orders")
            .set("Cookie", cookie)
            .send({ ticketId })
            .expect(404);
    });

    it("returns 400 if the ticket is already reserved (order exists for ticket)", async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const ticketId = new mongoose.Types.ObjectId().toHexString();

        const { ticket } = await createOrder({
            title,
            price,
            userId,
            id: ticketId,
        });

        const cookie = signin();

        await request(app)
            .post("/api/v1/orders")
            .set("Cookie", cookie)
            .send({ ticketId: ticket.id })
            .expect(400);
    });

    it("successfully creates an order with valid inputs and available ticket", async () => {
        const ticketId = new mongoose.Types.ObjectId().toHexString();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const ticket = await TicketModel.newTicket({
            title,
            price,
            userId,
            id: ticketId,
        });
        await ticket.save();

        const cookie = signin();

        await request(app)
            .post("/api/v1/orders")
            .set("Cookie", cookie)
            .send({ ticketId: ticket.id })
            .expect(201);
    });

    it("publishes an event after successfully creating an order", async () => {
        const ticketId = new mongoose.Types.ObjectId().toHexString();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const ticket = await TicketModel.newTicket({
            title,
            price,
            userId,
            id: ticketId,
        });
        await ticket.save();

        const cookie = signin();

        await request(app)
            .post("/api/v1/orders")
            .set("Cookie", cookie)
            .send({ ticketId: ticket.id })
            .expect(201);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});
