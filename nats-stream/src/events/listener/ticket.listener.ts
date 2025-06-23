import { Message } from "node-nats-streaming";
import { Listener } from "../listener";
import { Subjects } from "../../types/enum";
import { TicketCreatedEvent, TicketUpdatedEvent } from "../../types/streaming.interface";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], message: Message): void {
    console.log("data:", data);

    message.ack();
  }
}


export class TicketUpdateListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName: string = "payments-service";

  onMessage(data: TicketUpdatedEvent["data"], message: Message): void {
    console.log("data:", data);

    message.ack();
  }
}
