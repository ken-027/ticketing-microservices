# NATS Streaming Test Client

This directory contains a simple Node.js client for testing and interacting with the NATS Streaming Server used in the ticketing microservices application. It includes a publisher to send events and a listener to receive them, which is useful for debugging and manual testing of the event-driven architecture.

## Functionality

-   **Publisher (`client-publisher.ts`)**: Connects to the NATS cluster and publishes a sample `TicketCreated` event. This can be modified to publish other events and data for testing purposes.
-   **Listener (`client-listener.ts`)**: Connects to the NATS cluster and sets up subscriptions for `TicketCreated` and `TicketUpdated` events. It logs the received message data to the console.

## Prerequisites

-   A running NATS Streaming Server instance. The client is configured to connect to `http://localhost:4222`.

## Usage

You can run the publisher and listener in separate terminal windows to observe the event flow.

### To run the publisher:

This script will send a sample `TicketCreated` event.

```bash
npm run publisher
```

### To run the listener:

This script will listen for `TicketCreated` and `TicketUpdated` events and print them to the console.

```bash
npm run listener
```

## Setup

To install the dependencies, run:

```bash
npm install
```
