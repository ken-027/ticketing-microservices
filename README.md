# Ticketing Microservices Application

This is a microservices-based application for buying and selling event tickets, built with Node.js, TypeScript, and orchestrated with Docker and Kubernetes.

## Architecture Overview

The application is composed of several independent services that communicate with each other asynchronously using a NATS Streaming event bus. This decoupled architecture allows for better scalability, fault tolerance, and maintainability.

### Services

-   **Auth Service**: Manages user identity, including registration, sign-in, and session management.
-   **Ticket Service**: Handles the creation, viewing, and updating of tickets. It also manages ticket reservation status by listening to order events.
-   **Order Service**: Manages the lifecycle of an order, from creation to cancellation or completion. It coordinates between users, tickets, and payments.
-   **Expiration Service**: Listens for new orders and manages a job queue to automatically expire and cancel orders that are not paid within a specific time window.
-   **Payment Service**: Processes payments for orders using Stripe. It listens for order events and publishes payment completion events.

For more detailed information on each service, please refer to the `README.md` file within its respective directory.

## Core Technologies

-   **Backend**: Node.js, Express.js, TypeScript
-   **Database**: MongoDB
-   **Event Bus**: NATS Streaming Server
-   **Containerization & Orchestration**: Docker, Kubernetes
-   **Local Development**: Skaffold
-   **Payment Gateway**: Stripe
-   **Job Queue**: Bull (with Redis)

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

-   **Docker Desktop**: With Kubernetes enabled.
-   **Skaffold**: For managing the local development workflow.
-   **Kubernetes Ingress**: An Ingress controller, such as NGINX, must be running in your cluster to manage external access to the services.

## Local Development

This project uses Skaffold to streamline local development. Skaffold handles the building of Docker images, deployment to your local Kubernetes cluster, and file synchronization for hot-reloading.

### 1. Configure Host File

To allow your local machine to resolve the application's domain, add the following entry to your hosts file (`/etc/hosts` on macOS/Linux, `C:\\Windows\\System32\\drivers\\etc\\hosts` on Windows):

```
127.0.0.1 local.ticketing.dev
```

### 2. Set Up Environment Configuration

Each service requires a set of environment variables (e.g., JWT keys, Stripe keys, database URLs). This project uses `.env` files to manage this configuration, which are then used to create Kubernetes ConfigMaps and Secrets.

For each service (`auth-service`, `ticket-service`, `order-service`, `expiration-service`, `payment-service`), you will need to create a `.env` file in its root directory. You can use the examples provided in the sections below as a template.

Once you have created the `.env` file for each service, run the following commands from the project root to create the necessary Kubernetes resources:

```bash
kubectl create configmap auth-env --from-env-file=auth-service/.env
```
```bash
kubectl create configmap expiration-env --from-env-file=expiration-service/.env
```

```bash
kubectl create configmap order-env --from-env-file=order-service/.env
```

```bash
kubectl create configmap payment-env --from-env-file=payment-service/.env
```

```bash
kubectl create configmap ticket-env --from-env-file=ticket-service/.env
```


### 4. Run the Application

Once the prerequisites are met, you can start the entire application with a single command from the project root:

```bash
skaffold dev
```

Skaffold will build the images for all services, deploy them to your local Kubernetes cluster, and start streaming logs to your terminal. Any changes you make to the source code of a service will trigger a re-sync or rebuild, and the corresponding pod will be updated automatically.

The application will be available at **http://local.ticketing.dev**.
