import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all food items belonging to the specified type.
 */
export async function getItemsByType() {
  let conn, table;
  try {
    // connect to db
    conn = await connectDB();

    // query the user for search term
    const answers = await inquirer.prompt([
      {
        name: "itemType",
        message: "Enter the type of the food item to search:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Searching food item...").start();
    // searching in the database
    const results = await conn.query(
      "SELECT * FROM food_item_type NATURAL JOIN food_item WHERE type LIKE ?",
      [`%${answers.itemType}%`],
    );
    // stopping the spinner
    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.redBright("No food items found."));
    } else {
      // show table here
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Price"),
        chalk.green("Establishment ID"),
      ],
    });
    for (let tuple of results) {
      table.push([
        tuple.food_id,
        tuple.name,
        tuple.price,
        tuple.establishment_id,
      ]);
    }
    console.log(table.toString());
    }

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
