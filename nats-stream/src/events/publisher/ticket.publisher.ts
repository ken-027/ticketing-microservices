import { Subjects } from "../../types/enum";
import { TicketCreatedEvent } from "../../types/streaming.interface";
import { Publisher } from "../publisher";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
