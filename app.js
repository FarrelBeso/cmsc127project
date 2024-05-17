import { connectDB, disconnectDB } from "./db/connectDB.js";

// try to connect and disconnect
const conn = await connectDB();
await disconnectDB(conn);

// finally exit
process.exit(0);
