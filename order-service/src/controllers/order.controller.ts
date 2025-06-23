import { Request, Response } from "express";
import OrderModel from "../models/order.model";
import {
    HTTPCodes,
    natsWrapper,
    NotFoundError,
    OrderStatus,
    Ticket,
    UnAuthorizedError,
} from "@ksoftdev/core";
import TicketModel from "../models/ticket.model";
import { EXPIRATION_WINDOW_SECONDS } from "../config/env";
import {
    OrderCancelledPublisher,
    OrderCreatedPublisher,
} from "../events/order.publisher";

export async function newOrder(
    req: Request<{}, {}, { ticketId: string }>,
    res: Response,
) {
    const { id: authUserId } = req.session?.user!;
    const { ticketId } = req.body;

    const ticket = await TicketModel.findById(ticketId);

    if (!ticket) throw new NotFoundError("Ticket not found!");

    await ticket.validateInOrder();

    const expiration = new Date();

    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = await OrderModel.newOrder({
        userId: authUserId,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket,
    });

    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        userId: authUserId,
        status: OrderStatus.Created,
        expiresAt: order.expiresAt.toISOString(),
        version: order.version,
        ticket: {
            id: order.ticket.id,
            price: order.ticket.price,
        },
    });

    res.status(HTTPCodes.Created).send(order);
}

export async function getOrders(req: Request, res: Response) {
    const { id: userId } = req.session!.user;

    const orders = await OrderModel.find({
        userId,
    }).populate("ticket");

    res.send(orders || []);
}

export async function getOrder(
    req: Request<{ orderId: string }>,
    res: Response,
) {
    const { id: userId } = req.session!.user;
    const { orderId } = req.params;

    const order = await OrderModel.findById(orderId).populate("ticket");

    if (!order) throw new NotFoundError("order not found!");
    if (order.userId !== userId)
        throw new UnAuthorizedError("not authorize to view the ticket!");

    res.send(order);
}

export async function deleteOrder(
    req: Request<{ orderId: string }, {}, Ticket>,
    res: Response,
) {
    const { orderId } = req.params;
    const { id: userId } = req.session!.user;

    const order = await OrderModel.findById(orderId).populate("ticket");

    if (!order) throw new NotFoundError("order not found!");
    if (order.userId !== userId)
        throw new UnAuthorizedError("not authorize to cancel the ticket!");

    order.status = OrderStatus.Cancelled;

    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        },
    });

    res.status(HTTPCodes.NoContent).send();
}
