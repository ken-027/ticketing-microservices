import { NATS_CLIENT_ID, NATS_CLUSTER_ID, NATS_URL } from "./config/env";
import { handlingCloseConnection, natsWrapper } from "@ksoftdev/core";
import eventsListener from "./config/events-listener";

const start = async () => {
    await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
    handlingCloseConnection();
    await eventsListener();
};

start();
