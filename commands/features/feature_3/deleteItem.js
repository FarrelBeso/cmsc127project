import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Delete a food item.
 */
export async function deleteItem() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
      throw "Only admin users can delete a food item.";
    }

    // show all items
    // show all food items first with the allergen
    spinner = ora("Fetching food items...").start();
    const items = await conn.query(
      "SELECT f.food_id, f.name, e.name establishment_name FROM food_item f \
  JOIN food_establishment e ON f.establishment_id=e.establishment_id \
  ORDER BY e.name, f.name"
    );
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("No food items yet."));
      process.exit(0);
    }

    // show the tables otherwise
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Establishment Name"),
      ],
    });
    for (let tuple of items) {
      table.push([tuple.food_id, tuple.name, tuple.establishment_name]);
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

    // check if there is food id in the fetched items
    if (!items.find((item) => item.food_id == answers.id)) {
      console.log(chalk.magentaBright("Food id not found."));
      process.exit(0);
    }

    // starting the spinner
    spinner = ora("Deleting food item...").start();
    // deleting from the database
    await conn.query("DELETE FROM food_item WHERE food_id = ?", [answers.id]);
    // stopping the spinner
    spinner.stop();

    console.log(chalk.greenBright("Food item deleted successfully!"));

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
