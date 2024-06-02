import chalk from "chalk";
import ora from "ora";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";

/**
 * View all food items.
 */
export async function getAllItems() {
  let conn;
  try {
    // connect first
    conn = await connectDB();
    // starting the spinner
    const spinner = ora("Fetching all items...").start();
    const items = await conn.query("SELECT * FROM food_item");
    // stopping the spinner
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("Items not found."));
    } else {
      console.log(items);
    }
    // finally disconnect
    await disconnectDB(conn);
  } catch (error) {
    // Error Handling
    console.log(chalk.redBright(`Something went wrong, Error: ${error}`));
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  // close the program
  process.exit(0);
}
