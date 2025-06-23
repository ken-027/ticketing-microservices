import { Subjects } from "./enum";

export interface TicketCreatedEvent {
  readonly subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
    userId: string;
  };
}

export interface TicketUpdatedEvent {
  readonly subject: Subjects.TicketUpdated;
  data: {
    ticketId: string;
    payload: {
      title: string;
      price: number;
      userId: string;
    };
  };
}

export interface Event {
    subject: Subjects;
    data: any
}
