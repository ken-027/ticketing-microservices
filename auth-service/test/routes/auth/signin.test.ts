import request from "supertest";
import app from "../../../src/app";

describe("signin authentication", () => {
    it("returns a 400 on signin when user's not exists", async () => {
        return request(app)
            .post("/api/v1/auth/signin")
            .send({
                email,
                password,
            })
            .expect(400);
    });

    it("invalid credentials", async () => {
        await signin();

        return request(app)
            .post("/api/v1/auth/signin")
            .send({
                email,
                password: "test13",
            })
            .expect(400);
    });

    it("successfully signin", async () => {
        await signin();

        const response = await request(app)
            .post("/api/v1/auth/signin")
            .send({
                email,
                password,
            })
            .expect(200);

        expect(response.get("Set-Cookie")).toBeDefined();
    });
});
