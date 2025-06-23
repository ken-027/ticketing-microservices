import { Publisher, Subjects, ExpirationCompleteEvent } from "@ksoftdev/core";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
