import Queue from "bull";
import { REDIS_HOST } from "../config/env";
import { ExpirationCompletePublisher } from "../events/expiration.publisher";
import { natsWrapper } from "@ksoftdev/core";

interface Payload {
    orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
    redis: {
        host: REDIS_HOST,
    },
}).on("error", (err) => {
    console.log("error redis", err);
});

expirationQueue.process(async (job) => {
    const { orderId } = job.data;

    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId,
    });
});

export { expirationQueue };
