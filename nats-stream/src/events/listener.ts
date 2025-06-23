import { Message, Stan } from "node-nats-streaming";
import { Event } from "../types/streaming.interface";

export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  private client: Stan;
  protected ackWait: number = 5 * 1000;
  abstract onMessage(data: T['data'], message: Message): void;

  constructor(clientInstance: Stan) {
    this.client = clientInstance;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (message: Message) => {
      console.log(
        `#${message.getSequence()}:`,
        `${this.subject} / ${this.queueGroupName}`
      );

      const parseData = this.parseMessage(message);

      this.onMessage(parseData, message);
    });
  }

  parseMessage(message: Message) {
    const data = message.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}
