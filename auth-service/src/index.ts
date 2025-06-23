import { PORT } from "./config/env";
import app from "./app";
import dbConnect from "./config/db-connection.config";

app.listen(PORT, async () => {
    await dbConnect();
    console.log(`Auth service listening on port ${PORT}`);
});
