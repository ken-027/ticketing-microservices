import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../src/config/env";

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
});
