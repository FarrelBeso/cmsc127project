import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a review for an establishment.
 */
export async function updateEstabReview() {
  let conn, spinner;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    spinner = ora("Fetching your reviews...").start();

    // select which reviews has been made by the user
    const userReviews = await conn.query(
      "SELECT * FROM review WHERE user_id=? AND establishment_id IS NOT NULL",
      [loginResponse.user.user_id]
    );

    spinner.stop();

    if (userReviews.length === 0) {
      console.log(
        chalk.blueBright("You have no reviews made yet. Try adding one!")
      );
      process.exit(0);
    }

    console.log(userReviews);

    // query the user if the establishment exists
    const establishmentIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment:",
        type: "input",
      },
    ]);

    spinner = ora("Fetching your reviews...").start();

    const establishmentReviews = await conn.query(
      "SELECT * FROM review WHERE user_id=? AND establishment_id=?",
      [loginResponse.user.user_id, establishmentIdPrompt.id]
    );

    spinner.stop();

    if (establishmentReviews.length === 0) {
      console.log(chalk.blueBright("Establishment does not exist."));
      process.exit(0);
    }

    console.log(establishmentReviews);

    // then select which review id to select
    const reviewIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Select the id of the review:",
        type: "input",
      },
    ]);

    spinner = ora("Fetching review...").start();

    const review = await conn.query(
      "SELECT * FROM review WHERE review_id=? AND user_id=? AND establishment_id=?",
      [reviewIdPrompt.id, loginResponse.user.user_id, establishmentIdPrompt.id]
    );

    spinner.stop();

    if (review.length === 0) {
      console.log(chalk.blueBright("Review does not exist."));
      process.exit(0);
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
    spinner = ora("Updating review...").start();
    // updating the review in the database
    await conn.query(
      "UPDATE review SET rating=?, description=? WHERE establishment_id=? AND user_id=?",
      [
        answers.rating,
        answers.description,
        establishmentIdPrompt.id,
        loginResponse.user.user_id,
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
