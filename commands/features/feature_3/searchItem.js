import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";  // Added to display results in a table
import { connectDB, disconnectDB } from "../../../db/connectDB.js";

/**
 * Search for a food item.
 */
export async function searchItem() {
  let conn, table;
  try {
    conn = await connectDB();

    const answers = await inquirer.prompt([
      {
        name: "searchTerm",
        message: "Enter the name or type of the food item to search:",
        type: "input",
      },
    ]);

    const spinner = ora("Searching food items...").start();
    const results = await conn.query(
      "SELECT * FROM food_item WHERE name LIKE ? OR type LIKE ?",  // Make sure your schema includes a 'type' column or adjust this query
      [`%${answers.searchTerm}%`, `%${answers.searchTerm}%`]
    );
    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.blueBright("No food items found."));
      process.exit(0);
    }

    // show table here
    table = new CliTable3({
      head: [
        chalk.green("Item ID"),
        chalk.green("Name"),
        chalk.green("Price"),
        chalk.green("Type"),  // Make sure this column exists or adjust accordingly
        chalk.green("Availability")
      ],
    });
    for (let item of results) {
      table.push([
        item.item_id,
        item.name,
        item.price,
        item.type,  // Make sure this column exists or adjust accordingly
        item.availability ? 'Yes' : 'No'
      ]);
    }
    console.log(table.toString());

    await disconnectDB(conn);
  } catch (error) {
    console.log(chalk.redBright(`Something went wrong, Error: ${error}`));
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  process.exit(0);
}
