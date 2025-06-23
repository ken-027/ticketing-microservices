import { randomBytes } from "crypto";
import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/publisher/ticket.publisher";

const client = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

console.clear();

client.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const data = {
    id: "sadgh31fds3123",
    title: "Pacer vs Thunder Game 1",
    price: 12,
    userId: "sfasdf",
  };

  await new TicketCreatedPublisher(client).publish(data);
});
