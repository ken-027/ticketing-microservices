import { natsWrapper } from "@ksoftdev/core";
import {
    TicketCreatedListener,
    TicketUpdateListener,
} from "../events/ticket.listener";
import { ExpirationCompleteListener } from "../events/expiration.listener";
import { PaymentCreatedListener } from "../events/payment.listener";

export default function eventsListener() {
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdateListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
}
