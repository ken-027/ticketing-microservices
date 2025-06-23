import { Stan } from "node-nats-streaming";
import { Event } from "../types/streaming.interface";

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  private client: Stan;

  constructor(clientInstance: Stan) {
    this.client = clientInstance;
  }

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      const stringData = JSON.stringify(data);
      this.client.publish(this.subject, stringData, (err) => {
        if (err) return reject(err);

        console.log("Event published:", this.subject)

        resolve();
      });
    });
  }
}
