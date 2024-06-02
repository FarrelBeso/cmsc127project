import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";

/**
 * Search for a food establishment.
 */
export async function searchEstab() {
  let conn, table;
  try {
    // connect to db
    conn = await connectDB();

    // query the user for search term
    const answers = await inquirer.prompt([
      {
        name: "searchTerm",
        message: "Enter the name of the establishment to search:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Searching establishment...").start();
    // searching in the database
    const results = await conn.query(
      "SELECT * FROM food_establishment WHERE name LIKE ?",
      [`%${answers.searchTerm.toLowerCase()}%`]
    );
    // stopping the spinner
    spinner.stop();

    if (results.length === 0) {
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
    // loop for all items
    for (let tuple of results) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.address,
        tuple.email,
      ]);
    }
    console.log(table.toString());

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
