import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";
import { randomBytes } from "crypto";
import OrderPaymentModel from "../../src/models/order-payment.model";
import { OrderStatus } from "@ksoftdev/core";
import { stripe } from "../../lib/stripe.lib";
import PaymentModel from "../../src/models/payment.model";

// import stripe from "../../__mocks__/stripe";

describe("New payment feature", () => {
    it("returns a non-404 status for POST /api/v1/payments (route handler exists)", async () => {
        const response = await request(app).post("/api/v1/payments").send();

        expect(response.status).not.toEqual(404);
    });

    it("returns 401 if the user is not authenticated when creating an payment", async () => {
        await request(app).post("/api/v1/payments").send().expect(401);
    });

    it("returns 400 if required fields are missing when creating a payment", async () => {
        const cookie = signin();

        await request(app)
            .post("/api/v1/payments")
            .set("Cookie", cookie)
            .send()
            .expect(400);
    });

    it("returns 400 if the provided orderId is invalid when creating a payment", async () => {
        const orderId = "68529d865955ac40ee33497";
        const token = randomBytes(16).toString("hex");

        await request(app)
            .post("/api/v1/payments")
            .set("Cookie", signin())
            .send({
                orderId,
                token,
            })
            .expect(400);
    });

    it("returns 404 if the order does not exist when creating a payment", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const token = randomBytes(16).toString("hex");
        const cookie = signin();

        await request(app)
            .post("/api/v1/payments")
            .set("Cookie", cookie)
            .send({ orderId, token })
            .expect(404);
    });

    it("returns 401 when purchasing an order that doesn't belong to the user", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const token = randomBytes(16).toString("hex");
        const cookie = signin();

        const orderPayment = await OrderPaymentModel.newOrder({
            id: orderId,
            userId,
            status: OrderStatus.Created,
            price: 20,
            version: 0,
        });

        await request(app)
            .post("/api/v1/payments")
            .set("Cookie", cookie)
            .send({ orderId: orderPayment.id, token })
            .expect(401);
    });

    it("returns 201 when purchasing an order", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const price = Math.floor(Math.random() * 100_000);
        const userId = new mongoose.Types.ObjectId().toHexString();
        const token = "tok_visa";
        const cookie = signin({
            email: "test2@example.com",
            id: userId,
        });

        const orderPayment = await OrderPaymentModel.newOrder({
            id: orderId,
            userId,
            status: OrderStatus.Created,
            price,
            version: 0,
        });

        await request(app)
            .post("/api/v1/payments")
            .set("Cookie", cookie)
            .send({ orderId: orderPayment.id, token })
            .expect(201);

        const charge = await stripe.charges.list({ limit: 50 });
        const stripeCharge = charge.data.find(
            ({ amount }) => amount === price * 100,
        );

        expect(stripeCharge).toBeDefined();
        expect(stripeCharge!.currency).toEqual("usd");

        const payment = await PaymentModel.findOne({
            orderId,
            stripeId: stripeCharge!.id,
        });

        expect(payment).toBeDefined();
        expect(payment!.orderId).toEqual(orderId);
        expect(payment!.stripeId).toEqual(stripeCharge!.id);
    });

    it("returns 400 when purchasing an order that is invalid token", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const price = Math.floor(Math.random() * 100_000);
        const userId = new mongoose.Types.ObjectId().toHexString();
        const token = "tok_visas";
        const cookie = signin({
            email: "test2@example.com",
            id: userId,
        });

        const orderPayment = await OrderPaymentModel.newOrder({
            id: orderId,
            userId,
            status: OrderStatus.Created,
            price,
            version: 0,
        });

        await request(app)
            .post("/api/v1/payments")
            .set("Cookie", cookie)
            .send({ orderId: orderPayment.id, token })
            .expect(400);
    });

    it("returns 400 when purchasing a cancelled order", async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const userId = new mongoose.Types.ObjectId().toHexString();
        const token = randomBytes(16).toString("hex");
        const cookie = signin({
            email: "test2@example.com",
            id: userId,
        });

        const orderPayment = await OrderPaymentModel.newOrder({
            id: orderId,
            userId,
            status: OrderStatus.Cancelled,
            price: 20,
            version: 1,
        });

        await request(app)
            .post("/api/v1/payments")
            .set("Cookie", cookie)
            .send({ orderId: orderPayment.id, token })
            .expect(400);
    });
});
