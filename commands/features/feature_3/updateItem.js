import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a food item.
 */
export async function updateItem() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== 'admin') {
      throw "Only admin users can update a food item.";
    }

    // query the user for food item ID and new details
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
        name: "type",
        message: "Enter the new type of food item:",
        type: "input",
      },
      {
        name: "availability",
        message: "Is the item available (true/false)?",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Updating food item...").start();
    // updating the database
    await conn.query(
      "UPDATE food_item SET name = ?, price = ?, type = ?, availability = ? WHERE food_id = ?",
      [answers.name, answers.price, answers.type, answers.availability === 'true', answers.id]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.greenBright("Food item updated successfully!"));

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
