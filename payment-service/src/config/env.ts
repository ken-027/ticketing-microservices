import "dotenv/config";

type NodeEnv = "production" | "development" | "test";

const env = process.env;

export const PORT: number = Number(env.PORT || 5000);
export const JWT_SECRET: string = env.JWT_SECRET || "";
export const NODE_ENV: NodeEnv = (env.NODE_ENV as NodeEnv) || "development";

export const MONGODB_URL: string = env.MONGODB_URL || "";

export const NATS_CLUSTER_ID: string = env.NATS_CLUSTER_ID || "";
export const NATS_CLIENT_ID: string = env.NATS_CLIENT_ID || "";
export const NATS_URL: string = env.NATS_URL || "";

export const STRIPE_PUBLISH_KEY: string = env.STRIPE_PUBLISH_KEY || "";
export const STRIPE_SECRET_KEY: string = env.STRIPE_SECRET_KEY || "";
