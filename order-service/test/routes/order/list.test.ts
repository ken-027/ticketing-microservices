import mongoose from "mongoose";
import app from "../../../src/app";
import request from "supertest";

describe("Order list feature", () => {
    it("should confirm that the GET /api/v1/orders endpoint exists and does not return 404", async () => {
        const response = await request(app).get("/api/v1/orders").send();

        expect(response.status).not.toEqual(404);
    });

    it("should return 401 Unauthorized when trying to fetch orders without authentication", async () => {
        await request(app).get("/api/v1/orders").send().expect(401);
    });

    it("should return all orders belonging to the authenticated user", async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const ticketId = new mongoose.Types.ObjectId().toHexString();
        const ticketId2 = new mongoose.Types.ObjectId().toHexString();
        const ticketId3 = new mongoose.Types.ObjectId().toHexString();

        await Promise.all([
            createOrder({
                title,
                price,
                userId,
                id: ticketId,
            }),
            createOrder({
                title: "Pacers vs Thunders Game 4",
                price,
                userId,
                id: ticketId2,
            }),
            createOrder({
                title: "Pacers vs Thunders Game 5",
                price,
                userId,
                id: ticketId3,
            }),
        ]);

        const cookie = signin({
            email: "test@example.com",
            id: userId,
        });
        const response = await request(app)
            .get("/api/v1/orders")
            .set("Cookie", cookie)
            .send()
            .expect(200);

        expect(response.body).toHaveLength(3);
    });

    it("should ensure users can only fetch their own orders and not orders belonging to other users", async () => {
        const userId = new mongoose.Types.ObjectId().toHexString();
        const ticketId = new mongoose.Types.ObjectId().toHexString();
        const ticketId2 = new mongoose.Types.ObjectId().toHexString();
        const ticketId3 = new mongoose.Types.ObjectId().toHexString();
        const ticketId4 = new mongoose.Types.ObjectId().toHexString();
        const ticketId5 = new mongoose.Types.ObjectId().toHexString();
        const ticketId6 = new mongoose.Types.ObjectId().toHexString();

        await Promise.all([
            createOrder({
                title,
                price,
                userId,
                id: ticketId,
            }),
            createOrder({
                title: "Pacers vs Thunders Game 4",
                price,
                userId,
                id: ticketId2,
            }),
            createOrder({
                title: "Pacers vs Thunders Game 5",
                price,
                userId,
                id: ticketId3,
            }),
        ]);

        const cookie = signin({
            email: "test@example.com",
            id: userId,
        });
        const response = await request(app)
            .get("/api/v1/orders")
            .set("Cookie", cookie)
            .send()
            .expect(200);

        expect(response.body).toHaveLength(3);

        const userId2 = new mongoose.Types.ObjectId().toHexString();
        await Promise.all([
            createOrder({
                title: "Pacers vs Thunders Game 4",
                price,
                userId: userId2,
                id: ticketId4,
            }),
            createOrder({
                title: "Pacers vs Thunders Game 5",
                price,
                userId: userId2,
                id: ticketId5,
            }),
        ]);

        const userCookie2 = signin({
            email: "test2@example.com",
            id: userId2,
        });

        const response_test2 = await request(app)
            .get("/api/v1/orders")
            .set("Cookie", userCookie2)
            .send()
            .expect(200);

        expect(response_test2.body).toHaveLength(2);

        const userId3 = new mongoose.Types.ObjectId().toHexString();
        await Promise.all([
            createOrder({
                title: "Pacers vs Thunders Game 4",
                price,
                userId: userId3,
                id: ticketId6,
            }),
        ]);

        const userCookie3 = signin({
            email: "test2@example.com",
            id: userId3,
        });

        const response_test3 = await request(app)
            .get("/api/v1/orders")
            .set("Cookie", userCookie3)
            .send()
            .expect(200);

        expect(response_test3.body).toHaveLength(1);
    });
});
