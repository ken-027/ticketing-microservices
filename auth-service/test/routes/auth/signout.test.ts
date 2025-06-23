import request from "supertest";
import app from "../../../src/app";

describe("signout authentication", () => {
    it("not authenticated", () => {
        return request(app)
            .post("/api/v1/auth/signout")
            .send({
                email,
                password,
            })
            .expect(401);
    });

    it("signout successfully", async () => {
        const cookie = await signin();

        await request(app)
            .post("/api/v1/auth/signout")
            .set("Cookie", cookie)
            .send()
            .expect(200);
    });
});
