# Payment Service

This service is responsible for processing payments for orders. It exposes an API to create a new payment and communicates with other services using NATS events to keep its state synchronized.

## API Endpoints

The service exposes the following RESTful endpoint under the `/api/v1/payments` prefix:

-   `POST /`: Creates a new charge for an order. Requires an `orderId` and a Stripe payment `token`.

## Functionality

1.  **Replicates Order Data**: Listens to `OrderCreated` and `OrderCancelled` events to maintain a local database of orders relevant for payments.
2.  **Processes Payments**: When a payment request is received, it validates the order's status and user ownership.
3.  **Interacts with Stripe**: It uses the Stripe API to create a charge based on the order's price.
4.  **Publishes Payment Events**: After a successful charge, it saves the payment information and publishes a `PaymentCreated` event.

## Events

### Subscribes to:

-   `OrderCreated`: To create a local record of an order, including its price and user.
-   `OrderCancelled`: To update the status of its local order record to `cancelled`.

### Publishes:

-   `PaymentCreated`: When a payment has been successfully processed via Stripe.

## Dependencies

-   **NATS Streaming Server**: For asynchronous event-based communication.
-   **MongoDB**: As the primary database for storing payment information and replicated order data.
-   **Stripe**: For processing credit card payments.

## Environment Variables

| Variable          | Description                                     | Example Value          |
| ----------------- | ----------------------------------------------- | ---------------------- |
| `NATS_CLUSTER_ID` | The ID of the NATS cluster.                     | `ticketing`            |
| `NATS_CLIENT_ID`  | A unique client ID to connect to NATS.          | `payment-service`      |
| `NATS_URL`        | The URL of the NATS Streaming Server.           | `http://nats-srv:4222` |
| `MONGO_URL`       | The connection string for the MongoDB database. | `mongodb://payment-mongo-srv:27017/payment` |
| `JWT_KEY`         | Secret key for JWT verification.                | `your-jwt-secret`      |
| `STRIPE_KEY`      | The secret key for the Stripe API.              | `sk_test_...`          |
| `QUEUE_GROUP_NAME`| NATS queue group name.                          | `payment-service`      |

## Development

-   Install dependencies: `npm install`
-   Run in dev: `npm run dev`
-   Build: `npm run build`
