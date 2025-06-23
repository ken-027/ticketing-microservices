import { NATS_CLIENT_ID, NATS_CLUSTER_ID, NATS_URL, PORT } from "./config/env";
import app from "./app";
import dbConnect from "./config/db-connection.config";
import { handlingCloseConnection, natsWrapper } from "@ksoftdev/core";
import eventsListener from "./config/events-listener";

app.listen(PORT, async () => {
    console.log(`Payment service initializing...`);
    await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
    handlingCloseConnection();

    eventsListener();

    await dbConnect();
    console.log(`Ticket service listening on port ${PORT}`);
});
