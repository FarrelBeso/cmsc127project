import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all food items belonging to the specified type.
 */
export async function getItemsByType() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();

    // query the user for search term
    let types = [];
    let answers = await inquirer.prompt([
      {
        name: "itemType",
        message: "Enter the type of the food item to search:",
        type: "input",
      },
    ]);
    types.push(answers.itemType);
    let isQuerying = true;
    while (isQuerying) {
      answers = await inquirer.prompt([
        {
          name: "itemType",
          message:
            "Enter the type of the food item to search (leave blank if you're done):",
          type: "input",
        },
      ]);
      types.push(answers.itemType);
      if (answers.itemType.length === 0) {
        isQuerying = false;
      }
    }

    // starting the spinner
    spinner = ora("Searching food items...").start();
    // searching in the database
    const results = await conn.query(
      "SELECT * FROM food_item WHERE food_id IN (SELECT food_id FROM food_item_type WHERE type IN (?));",
      [types]
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
        ],
      });
      for (let tuple of results) {
        table.push([tuple.food_id, tuple.name, tuple.price]);
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
