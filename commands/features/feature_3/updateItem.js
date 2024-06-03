import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3"; // Importing CliTable3 to display items
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a food item.
 */
export async function updateItem() {
  let conn, spinner, table;
  try {
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== 'admin') {
      throw "Only admin users can update a food item.";
    }

    // Show all food items first
    spinner = ora("Fetching food items...").start();
    const items = await conn.query("SELECT * FROM food_item ORDER BY name");
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("No food items found."));
      process.exit(0);
    }

    // Show table here
    table = new CliTable3({
      head: [
        chalk.green("Item ID"),
        chalk.green("Name"),
        chalk.green("Price"),
        chalk.green("Availability")
      ],
    });
    for (let item of items) {
      table.push([
        item.food_id,
        item.name,
        item.price,
        item.availability ? 'Yes' : 'No'
      ]);
    }
    console.log(table.toString());

    // Query the user for food item ID and new details
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food item to update:",
        type: "input",
      },
      {
        name: "name",
        message: "Enter the new name of the food item:",
        type: "input",
      },
      {
        name: "price",
        message: "Enter the new price of the food item:",
        type: "input",
      },
      {
        name: "availability",
        message: "Is the item available (true/false)?",
        type: "input",
      },
    ]);

    // Start the spinner
    spinner = ora("Updating food item...").start();
    // Updating the database
    await conn.query(
      "UPDATE food_item SET name = ?, price = ?, availability = ? WHERE food_id = ?",
      [answers.name, answers.price, answers.availability === 'true', answers.id]
    );
    // Stop the spinner
    spinner.stop();

    console.log(chalk.greenBright("Food item updated successfully!"));

    await disconnectDB(conn);
  } catch (error) {
    console.log(chalk.redBright(`Something went wrong, Error: ${error}`));
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  process.exit(0);
}
