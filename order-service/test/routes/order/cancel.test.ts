import mongoose from "mongoose";
import app from "../../../src/app";
import request from "supertest";
import { OrderStatus } from "@ksoftdev/core";
import natsWrapper from "../../../__mocks__/nats-wrapper.mock";

describe("Order cancel feature", () => {
    it("should return a non-404 status for the DELETE /api/v1/orders/:orderId endpoint, confirming the route exists", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();

        const response = await request(app)
            .delete(`/api/v1/orders/${orderId}`)
            .send();

        expect(response.status).not.toEqual(404);
    });

    it("should return 401 Unauthorized if a user tries to cancel an order without authentication", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();

        await request(app)
            .delete(`/api/v1/orders/${orderId}`)
            .send()
            .expect(401);
    });

    it("should return 400 Bad Request if the orderId format is invalid when attempting to cancel an order", async () => {
        const orderId = "68529d865955ac40ee33497";
        const cookie = signin();

        await request(app)
            .delete(`/api/v1/orders/${orderId}`)
            .set("Cookie", cookie)
            .send()
            .expect(400);
    });

    it("should return 404 Not Found if the order does not exist for the given orderId", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const cookie = signin();

        await request(app)
            .delete(`/api/v1/orders/${orderId}`)
            .set("Cookie", cookie)
            .send()
            .expect(404);
    });

    it("should allow a user to cancel their own order and update the order status to Cancelled", async () => {
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

        await request(app)
            .delete(`/api/v1/orders/${order.id}`)
            .set("Cookie", cookie)
            .send()
            .expect(204);

        const response2 = await request(app)
            .get(`/api/v1/orders/${order.id}`)
            .set("Cookie", cookie)
            .send()
            .expect(200);

        expect(response2.body.status).toEqual(OrderStatus.Cancelled);
    });

    it("should not allow an authenticated user to cancel another user's order (should return 401 Unauthorized)", async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const userId2 = new mongoose.Types.ObjectId().toHexString();
        const ticketId = new mongoose.Types.ObjectId().toHexString();

        const { order } = await createOrder({
            title,
            price,
            userId,
            id: ticketId,
        });

        const otherCookie = signin({
            email: "test@example.com",
            id: userId2,
        });

        await request(app)
            .get(`/api/v1/orders/${order.id}`)
            .set("Cookie", otherCookie)
            .send()
            .expect(401);

        const cookie = signin({
            email: "test@example.com",
            id: userId,
        });

        await request(app)
            .delete(`/api/v1/orders/${order.id}`)
            .set("Cookie", cookie)
            .send()
            .expect(204);

        const response_test2 = await request(app)
            .get(`/api/v1/orders/${order.id}`)
            .set("Cookie", cookie)
            .expect(200);

        expect(response_test2.body.status).toEqual(OrderStatus.Cancelled);
    });

    it("should emit an order cancelled event when an order is successfully cancelled", async () => {
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

        await request(app)
            .delete(`/api/v1/orders/${order.id}`)
            .set("Cookie", cookie)
            .send()
            .expect(204);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});
