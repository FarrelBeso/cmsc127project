import chalk from "chalk";
import ora from "ora";
import { connectDB, disconnectDB } from "../db/connectDB.js";

/**
 * Get all establishments.
 */
export async function getEstablishments() {
  let conn;
  try {
    // connect first
    conn = await connectDB();
    // starting the spinner
    const spinner = ora("Fetching all establishments...").start();
    // fetching all the establishments from the database
    const establishments = await conn.query("SELECT * FROM food_establishment");
    // stopping the spinner
    spinner.stop();

    // check if establishments exist or not
    if (establishments.length === 0) {
      console.log(chalk.blueBright("Establishments not found."));
    } else {
      console.log(establishments);
    }
    // finally disconnect
    await disconnectDB(conn);
  } catch (error) {
    // Error Handling
    console.log("Something went wrong, Error: ", error);
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  // close the program
  process.exit(0);
}
