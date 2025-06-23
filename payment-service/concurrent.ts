import { JWT } from "@ksoftdev/core";
import axios from "axios";
import mongoose from "mongoose";

const signin = () => {
    const token = JWT.sign({
        email: "test@example.com",
        id: new mongoose.Types.ObjectId().toHexString(),
    });

    const session = { accessToken: token };
    const sessionJSON = JSON.stringify(session);
    const base64 = Buffer.from(sessionJSON).toString("base64");

    return `session=${base64};`;
};

const doRequest = async (game: number) => {
    const cookie = signin();

    try {
        const { data } = await axios.post(
            "http://local.ticketing.dev/api/v1/tickets",
            { title: `Pacers vs Thunder Game ${game}`, price: 15 },
            { headers: { cookie } },
        );

        const firstUpdate = axios.put(
            `http://local.ticketing.dev/api/v1/tickets/${data.id}`,
            { title: `Game ${game} Update 1`, price: 16 },
            { headers: { cookie } },
        );

        const secondUpdate = axios.put(
            `http://local.ticketing.dev/api/v1/tickets/${data.id}`,
            { title: `Game ${game} Update 2`, price: 17 },
            { headers: { cookie } },
        );

        await Promise.all([firstUpdate, secondUpdate]);
    } catch (err) {
        console.error(err);
    }
};

const run = async () => {
    const concurrentRequests = [];

    for (let i = 0; i < 400; i++) {
        concurrentRequests.push(doRequest(i + 1));
    }

    await Promise.all(concurrentRequests);
};

run();
