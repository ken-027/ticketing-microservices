import request from "supertest";
import app from "../../../src/app";
import mongoose from "mongoose";
import natsWrapper from "../../../__mocks__/nats-wrapper.mock";
import TicketModel from "../../../src/models/ticket.model";

describe("Ticket update feature", () => {
    it("should return a non-404 status if the PUT /api/v1/tickets/:id route exists", async () => {
        const response = await request(app)
            .put(`/api/v1/tickets/${ticketId}`)
            .send();

        expect(response.status).not.toEqual(404);
    });

    it("should return 401 if the user is not authenticated when updating a ticket", async () => {
        await request(app)
            .put(`/api/v1/tickets/${ticketId}`)
            .send()
            .expect(401);
    });

    it("should return 400 if invalid fields are provided when updating a ticket", async () => {
        const cookie = signin();
        const ticket = await createTicket();

        await request(app)
            .put(`/api/v1/tickets/${ticket.id}`)
            .set("Cookie", cookie)
            .send({})
            .expect(400);

        await request(app)
            .put(`/api/v1/tickets/${ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: ticket.title,
            })
            .expect(400);

        await request(app)
            .put(`/api/v1/tickets/${ticket.id}`)
            .set("Cookie", cookie)
            .send({
                price: ticket.price,
            })
            .expect(400);
    });

    it("should successfully update a ticket when valid inputs and authentication are provided", async () => {
        const cookie = signin();
        const ticket = await createTicket();
        const newTitle = "Pacers vs Thunder G2";
        const newPrice = 12;

        const response = await request(app)
            .put(`/api/v1/tickets/${ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: newTitle,
                price: newPrice,
            })
            .expect(200);

        expect(response.body.title).toEqual(newTitle);
        expect(response.body.price).toEqual(newPrice);
    });

    it("should return 400 if trying to update a ticket that is reserved (has an orderId)", async () => {
        const cookie = signin();
        const ticket = await createTicket();
        const newTitle = "Pacers vs Thunder G2";
        const newPrice = 12;

        const updateOrderTicket = await TicketModel.findById(ticket.id);

        updateOrderTicket!.orderId =
            new mongoose.Types.ObjectId().toHexString();

        await updateOrderTicket!.save();

        await request(app)
            .put(`/api/v1/tickets/${ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: newTitle,
                price: newPrice,
            })
            .expect(400);
    });

    it("should return 404 if trying to update a ticket that does not exist", async () => {
        const cookie = signin();
        const newTitle = "Pacers vs Thunder G2";
        const newPrice = 12;

        await request(app)
            .put(`/api/v1/tickets/${ticketId}`)
            .set("Cookie", cookie)
            .send({
                title: newTitle,
                price: newPrice,
            })
            .expect(404);
    });

    it("should return 401 if an authenticated user tries to update a ticket they do not own", async () => {
        const cookie = signin({
            email: "unknown@example.com",
            id: new mongoose.Types.ObjectId().toHexString(),
        });
        const ticket = await createTicket();
        const newTitle = "Pacers vs Thunder G2";
        const newPrice = 12;

        await request(app)
            .put(`/api/v1/tickets/${ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: newTitle,
                price: newPrice,
            })
            .expect(401);
    });

    it("should publish a ticket:updated event after a successful update", async () => {
        const cookie = signin();
        const ticket = await createTicket();
        const newTitle = "Pacers vs Thunder G2";
        const newPrice = 12;

        await request(app)
            .put(`/api/v1/tickets/${ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: newTitle,
                price: newPrice,
            })
            .expect(200);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});
