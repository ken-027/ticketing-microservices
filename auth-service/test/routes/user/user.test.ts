import request from "supertest";
import app from "../../../src/app";

describe("user routes", () => {
    it("returns a 401 on get current user", async () => {
        return request(app)
            .get("/api/v1/auth/users/current")
            .send()
            .expect(401);
    });

    it("get current authenticated user", async () => {
        const cookie = await signin();

        const response = await request(app)
            .get("/api/v1/auth/users/current")
            .set("Cookie", cookie)
            .send()
            .expect(200);

        expect(response.body.email).toEqual(email);
    });
});
