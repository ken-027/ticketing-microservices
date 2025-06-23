import mongoose from "mongoose";
import app from "../../../src/app";
import request from "supertest";

describe("Order get feature", () => {
    it("should return a non-404 response for the GET /api/v1/orders/:orderId endpoint, confirming the route exists", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();

        const response = await request(app)
            .get(`/api/v1/orders/${orderId}`)
            .send();

        expect(response.status).not.toEqual(404);
    });

    it("should return 401 Unauthorized if a user tries to get an order without authentication", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();

        await request(app).get(`/api/v1/orders/${orderId}`).send().expect(401);
    });

    it("should return 400 Bad Request when trying to get an order with an invalid orderId format", async () => {
        const orderId = "68529d865955ac40ee33497";
        const cookie = signin();

        await request(app)
            .get(`/api/v1/orders/${orderId}`)
            .set("Cookie", cookie)
            .send()
            .expect(400);
    });

    it("should return 404 Not Found when trying to get a non-existent order by id", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const cookie = signin();

        await request(app)
            .get(`/api/v1/orders/${orderId}`)
            .set("Cookie", cookie)
            .send()
            .expect(404);
    });

    it("should allow an authenticated user to fetch their own order by id", async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const ticketId = new mongoose.Types.ObjectId().toHexString();

        const { order } = await createOrder({
            title,
            price,
            userId,
            id: ticketId,
        });

        const cookie = signin({
            email: "test@example.com",
            id: userId,
        });

        const response = await request(app)
            .get(`/api/v1/orders/${order.id}`)
            .set("Cookie", cookie)
            .send()
            .expect(200);

        expect(response.body.id).toEqual(order.id);
    });

    it("should return 401 Unauthorized if an authenticated user tries to fetch another user's order", async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userId2 = new mongoose.Types.ObjectId().toHexString();
        const ticketId = new mongoose.Types.ObjectId().toHexString();

        const { order } = await createOrder({
            title,
            price,
            userId,
            id: ticketId,
        });

        const cookie = signin({
            email: "test@example.com",
            id: userId,
        });

        const response = await request(app)
            .get(`/api/v1/orders/${order.id}`)
            .set("Cookie", cookie)
            .send()
            .expect(200);

        expect(response.body.id).toBeDefined();

        const otherCookie = signin({
            email: "test@example.com",
            id: userId2,
        });

        await request(app)
            .get(`/api/v1/orders/${order.id}`)
            .set("Cookie", otherCookie)
            .send()
            .expect(401);
    });
});
