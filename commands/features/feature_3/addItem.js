import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";  // Importing CliTable3 for displaying items
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Add a food item.
 */
export async function addItem() {
  let conn, spinner, table;
  try {
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== 'admin') {
      throw "Only admin users can add a food item.";
    }

    // Show all food items first
    spinner = ora("Fetching food items...").start();
    const items = await conn.query("SELECT * FROM food_item ORDER BY name");
    spinner.stop();

    if (items.length > 0) {
      table = new CliTable3({
        head: [
          chalk.green("Item ID"),
          chalk.green("Name"),
          chalk.green("Price"),
          chalk.green("Establishment ID"),
          chalk.green("Availability")
        ],
      });
      for (let item of items) {
        table.push([
          item.food_id,
          item.name,
          item.price,
          item.establishment_id,
          item.availability ? 'Yes' : 'No'
        ]);
      }
      console.log(table.toString());
    } else {
      console.log(chalk.blueBright("No existing food items found. Proceed to adding new item."));
    }

    // Query the user for new food item details
    const answers = await inquirer.prompt([
      {
        name: "name",
        message: "Enter the name of the food item:",
        type: "input",
      },
      {
        name: "price",
        message: "Enter the price of the food item:",
        type: "input",
      },
      {
        name: "establishmentId",
        message: "Enter the establishment ID:",
        type: "input",
      },
      {
        name: "availability",
        message: "Is the item available (true/false)?",
        type: "input",
      },
    ]);

    spinner = ora("Adding food item...").start();
    await conn.query(
      "INSERT INTO food_item (name, price, establishment_id, availability) VALUES (?, ?, ?, ?)",
      [answers.name, answers.price, answers.establishmentId, answers.availability === 'true']
    );
    spinner.stop();

    console.log(chalk.greenBright("Food item added successfully!"));
    await disconnectDB(conn);
  } catch (error) {
    console.log(chalk.redBright(`Something went wrong, Error: ${error}`));
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  process.exit(0);
}
