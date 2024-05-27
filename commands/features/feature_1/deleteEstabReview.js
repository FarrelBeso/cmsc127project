import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Delete a review for an establishment.
 */
export async function deleteEstabReview() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    // query the user if the establishment exists
    const checkPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment:",
        type: "input",
      },
    ]);
    const establishments = await conn.query(
      "SELECT * FROM food_establishment WHERE establishment_id=?",
      [checkPrompt.id]
    );

    if (establishments.length === 0) {
      throw "Establishment does not exist.";
    }

    // starting the spinner
    const spinner = ora("Deleting review...").start();
    // deleting the review in the database
    await conn.query(
      "DELETE FROM review WHERE establishment_id=? AND user_id=?",
      [checkPrompt.id, loginResponse.user.user_id]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.blueBright("Review deleted!"));

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
