import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";
import {
  TicketCreatedListener,
  TicketUpdateListener,
} from "./events/listener/ticket.listener";

const clientInstance = nats.connect(
  "ticketing",
  randomBytes(4).toString("hex"),
  {
    url: "http://localhost:4222",
  }
);

console.clear();

clientInstance.on("connect", () => {
  console.log("Listener connected to NATS");

  clientInstance.on("close", () => {
    console.log("NATS connection is closed");
    process.exit();
  });

  new TicketCreatedListener(clientInstance).listen();
  new TicketUpdateListener(clientInstance).listen();
});

process.on("SIGINT", () => clientInstance.close());
process.on("SIGTERM", () => clientInstance.close());
