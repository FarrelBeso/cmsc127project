import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a review for an establishment.
 */
export async function updateEstabReview() {
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
      "SELECT * FROM food_establishment where establishment_id=?",
      [checkPrompt.id]
    );

    if (establishments.length === 0) {
      throw "Establishment does not exist.";
    }

    // query for the review info to be updated
    const answers = await inquirer.prompt([
      {
        name: "rating",
        message: "New review rating:",
        type: "input",
      },
      {
        name: "description",
        message: "New review description:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Updating review...").start();
    // updating the review in the database
    await conn.query(
      "UPDATE review SET rating=?, description=? WHERE establishment_id=? AND user_id=?",
      [
        answers.rating,
        answers.description,
        checkPrompt.id,
        loginResponse.user.user_id
      ]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.blueBright("Review updated!"));

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
