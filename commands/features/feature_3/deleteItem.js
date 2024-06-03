import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";  // Importing CliTable3 for displaying items
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Delete a food item.
 */
export async function deleteItem() {
  let conn, spinner, table;
  try {
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== 'admin') {
      throw "Only admin users can delete a food item.";
    }

    // show all food items first
    spinner = ora("Searching food items...").start();
    const items = await conn.query("SELECT * FROM food_item ORDER BY name");
    spinner.stop();

    // exit if there are none
    if (items.length === 0) {
      console.log(chalk.blueBright("No food items found."));
      process.exit(0);
    }

    // show table here
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
        item.item_id,
        item.name,
        item.price,
        item.establishment_id,
        item.availability
      ]);
    }
    console.log(table.toString());

    // query the user for food item ID
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food item to delete:",
        type: "input",
      },
    ]);

    spinner = ora("Deleting food item...").start();
    await conn.query(
      "DELETE FROM food_item WHERE item_id = ?",  // Make sure the column name matches
      [answers.id]
    );
    spinner.stop();

    console.log(chalk.greenBright("Food item deleted successfully!"));

    await disconnectDB(conn);
  } catch (error) {
    console.log(chalk.redBright(`Something went wrong, Error: ${error}`));
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  process.exit(0);
}
