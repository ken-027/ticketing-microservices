# Order Service

This service manages orders for tickets. It provides endpoints for creating, retrieving, and cancelling orders. It also listens to events from other services to keep its data consistent and publishes events about order status changes.

## API Endpoints

The service exposes the following RESTful endpoints under the `/api/v1/orders` prefix:

-   `POST /`: Creates a new order for a ticket.
-   `GET /`: Retrieves a list of orders for the authenticated user.
-   `GET /:orderId`: Retrieves a specific order by its ID.
-   `DELETE /:orderId`: Cancels a specific order.

## Events

### Subscribes to:

-   `TicketCreated`: To create a local copy of a ticket when it's created in the `ticket-service`.
-   `TicketUpdated`: To update the local copy of a ticket when it's updated in the `ticket-service`.
-   `ExpirationComplete`: To cancel an order when it has expired.
-   `PaymentCreated`: To mark an order as complete when a payment has been successfully processed.

### Publishes:

-   `OrderCreated`: When a new order is successfully created.
-   `OrderCancelled`: When an order is cancelled, either by the user or due to expiration.

## Dependencies

-   **NATS Streaming Server**: For asynchronous event-based communication.
-   **MongoDB**: As the primary database for storing order and ticket information.

## Environment Variables

| Variable                  | Description                                     | Example Value           |
| ------------------------- | ----------------------------------------------- | ----------------------- |
| `NATS_CLUSTER_ID`         | The ID of the NATS cluster.                     | `ticketing`             |
| `NATS_CLIENT_ID`          | A unique client ID to connect to NATS.          | `order-service`         |
| `NATS_URL`                | The URL of the NATS Streaming Server.           | `http://nats-srv:4222`  |
| `MONGO_URL`               | The connection string for the MongoDB database. | `mongodb://order-mongo-srv:27017/order` |
| `JWT_KEY`                 | Secret key for JWT verification.                | `your-jwt-secret`       |
| `EXPIRATION_WINDOW_SECONDS`| The time in seconds before a created order expires. | `900`                   |
| `QUEUE_GROUP_NAME`        | NATS queue group name.                          | `order-service`         |


## Development

-   Install dependencies: `npm install`
-   Run in dev: `npm run dev`
-   Build: `npm run build`
