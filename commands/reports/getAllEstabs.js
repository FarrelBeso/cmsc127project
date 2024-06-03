import chalk from "chalk";
import ora from "ora";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * View all food establishments.
 */
export async function getAllEstabs() {
  let conn, spinner, table;
  try {
    // connect first
    conn = await connectDB();

    // show all establishments
    spinner = ora("Searching establishments...").start();
    const establishments = await conn.query(
      "SELECT * FROM food_establishment ORDER BY name"
    );
    spinner.stop();

    // exit if there are none
    if (establishments.length === 0) {
      console.log(chalk.blueBright("No establishments found."));
      process.exit(0);
    }

    // show table here
    table = new CliTable3({
      head: [
        chalk.green("Establishment ID"),
        chalk.green("Name"),
        chalk.green("Address"),
        chalk.green("Email"),
      ],
    });
    for (let tuple of establishments) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.address,
        tuple.email,
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
