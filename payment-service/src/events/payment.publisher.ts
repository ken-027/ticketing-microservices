import {
    Publisher,
    Subjects,
    PaymentCreatedEvent,
} from "@ksoftdev/core";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
