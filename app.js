import getEstablishments from "./commands/establishment_cmds.js";
import { connectDB, disconnectDB } from "./db/connectDB.js";

// try to connect and disconnect
const conn = await connectDB();
// try to get establishments
await getEstablishments(conn);
await disconnectDB(conn);

// finally exit
process.exit(0);
