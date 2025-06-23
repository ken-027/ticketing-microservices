import request from "supertest";
import app from "../../../src/app";
import natsWrapper from "../../../__mocks__/nats-wrapper.mock";

describe("Ticket create feature", () => {
    it("should verify that the POST /api/v1/tickets route exists", async () => {
        const response = await request(app).post("/api/v1/tickets").send({});

        expect(response.status).not.toEqual(404);
    });

    it("should return 401 if the user is not authenticated when creating a ticket", async () => {
        await request(app).post("/api/v1/tickets").send({}).expect(401);
    });

    it("should return 400 if required fields (title or price) are missing when creating a ticket", async () => {
        const cookie = signin();

        await request(app)
            .post("/api/v1/tickets")
            .set("Cookie", cookie)
            .send({
                price,
            })
            .expect(400);

        await request(app)
            .post("/api/v1/tickets")
            .set("Cookie", cookie)
            .send({
                title,
            })
            .expect(400);
    });

    it("should return 400 if the price is invalid (e.g., negative) when creating a ticket", async () => {
        const cookie = signin();

        const response = await request(app)
            .post("/api/v1/tickets")
            .set("Cookie", cookie)
            .send({
                title,
                price: -3,
            })
            .expect(400);

        expect(response.body.errors[0].field).toEqual("price");
    });

    it("should successfully create a ticket with valid inputs and return the ticket details", async () => {
        const cookie = signin();

        const response = await request(app)
            .post("/api/v1/tickets")
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(201);

        expect(response.body.title).toEqual(title);
        expect(response.body.price).toEqual(price);
        expect(response.body.id).toBeDefined();
    });

    it("should not allow creating a duplicate ticket with the same title and price for the same user", async () => {
        const cookie = signin();

        const response = await request(app)
            .post("/api/v1/tickets")
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(201);

        expect(response.body.title).toEqual(title);
        expect(response.body.price).toEqual(price);
        expect(response.body.id).toBeDefined();

        await request(app)
            .post("/api/v1/tickets")
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(400);
    });

    it("should emit a ticket created event after successfully creating a ticket", async () => {
        const cookie = signin();

        await request(app)
            .post("/api/v1/tickets")
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(201);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});
