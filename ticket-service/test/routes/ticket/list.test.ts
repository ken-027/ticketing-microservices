import request from "supertest";
import app from "../../../src/app";

describe("Get tickets", () => {
    it("should retrieve a list of all available tickets for an authenticated user", async () => {
        const cookie = signin();

        await Promise.all([
            createTicket({
                title: "Pacer vs Thunder Game 1",
                price: 10,
            }),
            createTicket({
                title: "Pacer vs Thunder Game 2",
                price: 10,
            }),
            createTicket({
                title: "Pacer vs Thunder Game 3",
                price: 10,
            }),
            createTicket({
                title: "Pacer vs Thunder Game 4",
                price: 10,
            }),
            createTicket({
                title: "Pacers vs Thunder Game 5",
                price: 10,
            }),
        ]);

        const response = await request(app)
            .get("/api/v1/tickets")
            .set("Cookie", cookie)
            .expect(200);

        expect(response.body).toHaveLength(5);
    });

    it("should fetch the details of a specific ticket by its ID", async () => {
        const cookie = signin();

        const response = await createTicket();

        const ticketResponse = await request(app)
            .get(`/api/v1/tickets/${response.id}`)
            .set("Cookie", cookie)
            .expect(200);

        expect(ticketResponse.body.title).toEqual(title);
        expect(ticketResponse.body.price).toEqual(price);
    });

    it("should return a 404 error when attempting to fetch a ticket that does not exist", async () => {
        const cookie = signin();

        await request(app)
            .get(`/api/v1/tickets/${ticketId}`)
            .set("Cookie", cookie)
            .expect(404);
    });

    it("should return a 400 error when an invalid ticket ID format is provided", async () => {
        const cookie = signin();

        await request(app)
            .get(`/api/v1/tickets/${"sdf"}`)
            .set("Cookie", cookie)
            .expect(400);
    });
});
