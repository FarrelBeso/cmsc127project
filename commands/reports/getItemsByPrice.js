import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all food items within a set price range.
 */
export async function getItemsByPrice() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();

    // query the user for price range
    const answers = await inquirer.prompt([
      {
        name: "minPrice",
        message: "Enter the minimum price of the food item to search:",
        type: "input",
      },
      {
        name: "maxPrice",
        message: "Enter the maximum price of the food item to search:",
        type: "input",
      },
    ]);

    // starting the spinner
    spinner = ora("Searching food item...").start();
    // searching in the database
    const results = await conn.query(
      "SELECT f.food_id, f.name, f.price, f.availability, e.name establishment_name FROM food_item f \
      JOIN food_establishment e ON f.establishment_id=e.establishment_id \
      WHERE f.price >= ? AND f.price <= ? \
      ORDER BY e.name, f.name",
      [answers.minPrice, answers.maxPrice]
    );
    // stopping the spinner
    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.blueBright("No food items found."));
      process.exit(0);
    }

    // show table here
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Price"),
        chalk.green("Availability"),
        chalk.green("Establishment Name"),
      ],
    });
    for (let tuple of results) {
      table.push([
        tuple.food_id,
        tuple.name,
        tuple.price,
        tuple.availability == 1 ? "Available" : "Not Available",
        tuple.establishment_name,
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
