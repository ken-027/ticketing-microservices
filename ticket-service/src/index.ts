import { NATS_CLIENT_ID, NATS_CLUSTER_ID, NATS_URL, PORT } from "./config/env";
import app from "./app";
import dbConnect from "./config/db-connection.config";
import { handlingCloseConnection, natsWrapper } from "@ksoftdev/core";

app.listen(PORT, async () => {
    await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
    handlingCloseConnection();

    await dbConnect();
    console.log(`Ticket service listening on port ${PORT}`);
});
