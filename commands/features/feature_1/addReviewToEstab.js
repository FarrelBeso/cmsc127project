import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../db/connectDB.js";
import { login } from "./auth_cmds.js";

/**
 * Leave a review to an establishment.
 */
export async function addReviewToEstab() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    // first query the user if the establishment exists
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

    // then we can now query for the review info
    // TODO: Review description should be optional
    const answers = await inquirer.prompt([
      {
        name: "rating",
        message: "Review rating:",
        type: "input",
      },
      {
        name: "description",
        message: "Review description:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Adding review...").start();
    // fetching all the establishments from the database
    // only review the first establishment
    await conn.query(
      "INSERT INTO review (rating, user_id, description, establishment_id) VALUES (?, ?, ?, ?)",
      [
        answers.rating,
        loginResponse.user.user_id,
        answers.description,
        establishments[0].establishment_id,
      ]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.blueBright("Review added!"));

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
