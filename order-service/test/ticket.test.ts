import mongoose from "mongoose";
import TicketModel from "../src/models/ticket.model";

describe("concurrent test request", () => {
    it("implements optimistic concurrency control", async () => {
        const ticket = await TicketModel.newTicket({
            title: "Pacers vs Thunder G2",
            price: 20,
            userId: new mongoose.Types.ObjectId().toHexString(),
            id: new mongoose.Types.ObjectId().toHexString(),
        });

        const instance1 = await TicketModel.findById(ticket.id);
        const instance2 = await TicketModel.findById(ticket.id);

        instance1!.price = 30;
        instance2!.price = 50;

        await instance1!.save();
        try {
            await instance2!.save();
        } catch (err) {
            return;
        }

        throw new Error("Error this point");
    });

    it("increments the version number on multiple saves", async () => {
        const ticket = await TicketModel.newTicket({
            title: "Pacers vs Thunder G2",
            price: 20,
            userId: new mongoose.Types.ObjectId().toHexString(),
            id: new mongoose.Types.ObjectId().toHexString(),
        });

        expect(ticket.version).toEqual(0);
        await ticket.save();
        expect(ticket.version).toEqual(1);
        await ticket.save();
        expect(ticket.version).toEqual(2);
    });
});
