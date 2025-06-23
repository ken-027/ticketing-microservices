import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app";

let mongo: MongoMemoryServer;

declare global {
    var signin: () => Promise<string>;
    var email: string;
    var password: string;
}

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    const collections = await mongoose.connection.db?.collections();

    if (!collections) {
        console.error("no collections found!");
        return;
    }

    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.email = "test@email.com";
global.password = "test123";

global.signin = async () => {
    const response = await request(app)
        .post("/api/v1/auth/signup")
        .send({ email, password })
        .expect(201);

    const cookie = response.get("Set-Cookie") as string[];

    expect(cookie).toBeDefined();

    return cookie[0];
};
