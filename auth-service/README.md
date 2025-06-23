# Auth Service

This service is responsible for handling user authentication and identity management. It provides endpoints for user sign-up, sign-in, sign-out, and retrieving the current user's information.

## API Endpoints

The service exposes the following RESTful endpoints under the `/api/v1/auth` prefix:

-   `POST /signup`: Registers a new user.
-   `POST /signin`: Authenticates a user and starts a session.
-   `POST /signout`: Clears the user's session.
-   `GET /users/current`: Retrieves the profile of the currently authenticated user.

## Dependencies

-   **MongoDB**: As the primary database for storing user credentials. All environment configuration is managed in the root `README.md`.

## Development

-   Install dependencies: `npm install`
-   Run in dev: `npm run dev`
-   Build: `npm run build`
