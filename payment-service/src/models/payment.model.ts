import { Model, Schema, model } from "mongoose";

export interface Payment {
    orderId: string;
    stripeId: string;
}

export interface PaymentDoc extends Document, Payment {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentFunctions {
    newPayment(ticket: Payment): Promise<PaymentDoc>;
    findPreviousVersion: (
        id: string,
        version: number,
    ) => Promise<PaymentDoc | null>;
}

const paymentSchema = new Schema<PaymentDoc>(
    {
        orderId: { type: String, required: true },
        stripeId: { type: String, required: true },
    },
    {
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
        timestamps: true,
    },
);

paymentSchema.static("newPayment", async (payment: Payment) => {
    const createdPayment = await new PaymentModel(payment);
    await createdPayment.save();

    return createdPayment;
});

const PaymentModel = model<PaymentDoc, Model<PaymentDoc> & PaymentFunctions>(
    "Payment",
    paymentSchema,
);

export default PaymentModel;
