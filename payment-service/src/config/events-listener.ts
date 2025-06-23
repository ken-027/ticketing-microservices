import { natsWrapper } from "@ksoftdev/core";
import { OrderCancelledListener, OrderCreatedListener } from "../events/order.listener";

export default function eventsListener() {
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
}
