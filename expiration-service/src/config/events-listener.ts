import { natsWrapper } from "@ksoftdev/core";
import { OrderCreatedListener } from "../events/order.listener";

export default function eventsListener() {
    new OrderCreatedListener(natsWrapper.client).listen();
}
