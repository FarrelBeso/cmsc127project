import chalk from "chalk";
import ora from "ora";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";

/**
 * View all food items.
 */
export async function getAllItems() {
  let conn, spinner, table;
  try {
    // connect first
    conn = await connectDB();

    // get all items
    spinner = ora("Fetching all food items...").start();
    const items = await conn.query(
      "SELECT f.food_id, f.name, f.price, f.availability, e.name establishment_name FROM food_item f \
    JOIN food_establishment e ON f.establishment_id=e.establishment_id \
    ORDER BY e.name, f.name"
    );
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("Food items not found."));
      process.exit(0);
    }

    // otherwise, show the item table
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Price (PhP)"),
        chalk.green("Availability"),
        chalk.green("Establishment Name"),
      ],
    });
    for (let tuple of items) {
      table.push([
        tuple.food_id,
        tuple.name,
        tuple.price,
        tuple.availability === 1 ? "Available" : "Not Available",
        tuple.establishment_name,
      ]);
    }
    console.log(table.toString());

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
