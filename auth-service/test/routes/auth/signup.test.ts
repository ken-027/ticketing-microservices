import request from "supertest";
import app from "../../../src/app";

describe("signup authentication", () => {
    it("returns a 201 on signup when success", () => {
        return request(app)
            .post("/api/v1/auth/signup")
            .send({
                email,
                password,
            })
            .expect(201);
    });

    it("returns a 400 on signup when users already exists", async () => {
        await request(app)
            .post("/api/v1/auth/signup")
            .send({
                email,
                password,
            })
            .expect(201);

        await request(app)
            .post("/api/v1/auth/signup")
            .send({
                email,
                password,
            })
            .expect(400);
    });

    it("returns a 400 on signup for invalid email and password", async () => {
        await request(app)
            .post("/api/v1/auth/signup")
            .send({
                email: "test@example",
                password,
            })
            .expect(400);

        await request(app)
            .post("/api/v1/auth/signup")
            .send({
                email,
                password: "tes",
            })
            .expect(400);

        await request(app)
            .post("/api/v1/auth/signup")
            .send({
                password,
            })
            .expect(400);

        await request(app)
            .post("/api/v1/auth/signup")
            .send({
                email,
            })
            .expect(400);
    });

    it("sets a cookie after successful signup", async () => {
        const response = await request(app)
            .post("/api/v1/auth/signup")
            .send({
                email,
                password,
            })
            .expect(201);

        expect(response.get("Set-Cookie")).toBeDefined();
    });
});
