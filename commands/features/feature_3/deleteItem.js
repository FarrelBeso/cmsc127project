import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Delete a food item.
 */
export async function deleteItem() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== 'admin') {
      throw "Only admin users can delete a food item.";
    }

    // query the user for food item ID
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food item to delete:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Deleting food item...").start();
    // deleting from the database
    await conn.query(
      "DELETE FROM food_item WHERE item_id = ?",
      [answers.id]
    );
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
