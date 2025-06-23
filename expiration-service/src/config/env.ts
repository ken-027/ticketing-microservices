import "dotenv/config";

const env = process.env;

export const NATS_CLUSTER_ID: string = env.NATS_CLUSTER_ID || "";
export const NATS_CLIENT_ID: string = env.NATS_CLIENT_ID || "";
export const NATS_URL: string = env.NATS_URL || "";
export const REDIS_HOST: string = env.REDIS_HOST || "";
