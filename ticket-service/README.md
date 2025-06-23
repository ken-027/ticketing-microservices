# Ticket Service

This service is responsible for managing tickets. It handles the creation, retrieval, and updating of tickets. It also listens for events from the `order-service` to manage ticket reservation status.

## API Endpoints

The service exposes the following RESTful endpoints under the `/api/v1/tickets` prefix:

-   `POST /`: Creates a new ticket.
-   `GET /`: Retrieves a list of all tickets.
-   `GET /:ticketId`: Retrieves a specific ticket by its ID.
-   `PUT /:ticketId`: Updates the details of a specific ticket.

## Functionality

1.  **Manages Tickets**: Provides core CRUD functionality for tickets.
2.  **Publishes Ticket Events**: Publishes `TicketCreated` and `TicketUpdated` events to notify other services of changes to tickets.
3.  **Reserves Tickets**: Listens for `OrderCreated` events to reserve a ticket by associating it with an `orderId`.
4.  **Releases Tickets**: Listens for `OrderCancelled` events to release a reserved ticket, making it available again.

## Events

### Subscribes to:

-   `OrderCreated`: To reserve a ticket when an order is created.
-   `OrderCancelled`: To release a ticket when an order is cancelled.

### Publishes:

-   `TicketCreated`: When a new ticket is created.
-   `TicketUpdated`: When a ticket's details are updated, including when it is reserved or released.

## Dependencies

-   **NATS Streaming Server**: For asynchronous event-based communication.
-   **MongoDB**: As the primary database for storing ticket information.

## Environment Variables

| Variable          | Description                                     | Example Value          |
| ----------------- | ----------------------------------------------- | ---------------------- |
| `NATS_CLUSTER_ID` | The ID of the NATS cluster.                     | `ticketing`            |
| `NATS_CLIENT_ID`  | A unique client ID to connect to NATS.          | `ticket-service`       |
| `NATS_URL`        | The URL of the NATS Streaming Server.           | `http://nats-srv:4222` |
| `MONGO_URL`       | The connection string for the MongoDB database. | `mongodb://ticket-mongo-srv:27017/ticket` |
| `JWT_KEY`         | Secret key for JWT verification.                | `your-jwt-secret`      |
| `QUEUE_GROUP_NAME`| NATS queue group name.                          | `ticket-service`       |

## Development

-   Install dependencies: `npm install`
-   Run in dev: `npm run dev`
-   Build: `npm run build`
