# Expiration Service

This service is responsible for handling order expirations. It listens for `OrderCreated` events and schedules a job to be executed when the order expires. When the job is executed, it publishes an `ExpirationComplete` event.

## Functionality

1.  **Listens for `OrderCreated` events**: When a new order is created, this service receives a notification.
2.  **Schedules an expiration job**: A job is added to a queue (using Bull and Redis) that will be processed after a specific delay, corresponding to the order's expiration time.
3.  **Publishes `ExpirationComplete` event**: Once the job is processed, it signifies that the order has expired, and an `ExpirationComplete` event is published. Other services can listen to this event to perform actions like cancelling the order or releasing a reserved ticket.

## Events

### Subscribes to:

-   `OrderCreated`: To know when to schedule an expiration.

### Publishes:

-   `ExpirationComplete`: To notify other services that an order has expired.

## Dependencies

-   **NATS Streaming Server**: For asynchronous communication with other microservices.
-   **Redis**: As a message broker for the Bull queue.

## Environment Variables

The following environment variables are required to run this service:

| Variable          | Description                              | Example Value          |
| ----------------- | ---------------------------------------- | ---------------------- |
| `NATS_CLUSTER_ID` | The ID of the NATS cluster.              | `ticketing`            |
| `NATS_CLIENT_ID`  | A unique client ID to connect to NATS.   | `expiration-service`   |
| `NATS_URL`        | The URL of the NATS Streaming Server.    | `http://nats-srv:4222` |
| `REDIS_HOST`      | The hostname of the Redis instance.      | `expiration-redis-srv` |
| `QUEUE_GROUP_NAME`| NATS queue group name.                   | `expiration-service`   |

## Development

-   Install dependencies: `npm install`
-   Run in dev: `npm run dev`
-   Build: `npm run build`
