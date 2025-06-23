import { Request, Response } from "express";
import TicketModel from "../models/ticket.model";
import type { Ticket, User } from "@ksoftdev/core";
import { HTTPCodes, NotFoundError, natsWrapper } from "@ksoftdev/core";
import {
    TicketCreatedPublisher,
    TicketUpdatedPublisher,
} from "../events/ticket.publisher";

export async function newTicket(req: Request<{}, {}, Ticket>, res: Response) {
    const { id } = req.session?.user;
    const { title, price } = req.body;

    const ticket = {
        userId: id,
        title,
        price,
    };

    await TicketModel.checkTicket(ticket);

    const createdTicket = await TicketModel.newTicket(ticket);

    new TicketCreatedPublisher(natsWrapper.client).publish({
        id: createdTicket.id,
        title: createdTicket.title,
        price: createdTicket.price,
        userId: createdTicket.userId,
        version: createdTicket.version,
    });

    res.status(HTTPCodes.Created).send(createdTicket);
}

export async function getTickets(_req: Request, res: Response) {
    const tickets = await TicketModel.find();
    res.send(tickets);
}

export async function getTicket(
    req: Request<{ ticketId: string }>,
    res: Response,
) {
    const { ticketId } = req.params;

    const ticket = await TicketModel.findById(ticketId);

    if (!ticket) throw new NotFoundError(`ticket ${ticketId} not found!`);

    res.send(ticket);
}

export async function updateTicket(
    req: Request<{ ticketId: string }, {}, Ticket>,
    res: Response,
) {
    const { ticketId } = req.params;
    const { price, title } = req.body;
    const { id: userId } = req.session?.user satisfies User;

    const updateTicked = await TicketModel.updateTicket(ticketId, {
        price,
        title,
        userId: userId,
    });

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
        ticketId,
        payload: {
            price: updateTicked.price,
            title: updateTicked.title,
            userId: updateTicked.userId,
            version: updateTicked.version,
        },
    });

    res.send(updateTicked);
}
