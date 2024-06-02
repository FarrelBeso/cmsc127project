import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { format } from "date-fns";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a review for an establishment.
 */
export async function updateEstabReview() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    // get your reviews on all establishments
    spinner = ora("Fetching your reviews...").start();
    const userReviews = await conn.query(
      "SELECT * FROM review WHERE user_id=? AND establishment_id IS NOT NULL",
      [loginResponse.user.user_id]
    );
    spinner.stop();

    // stop if there are no reviews yet
    if (userReviews.length === 0) {
      console.log(
        chalk.blueBright("You have no reviews made yet. Try adding one!")
      );
      process.exit(0);
    }

    // show table
    table = new CliTable3({
      head: [
        chalk.green("Review ID"),
        chalk.green("Review Date"),
        chalk.green("Rating"),
        chalk.green("Description"),
        chalk.green("Establishment ID"),
      ],
    });
    for (let tuple of userReviews) {
      table.push([
        tuple.review_id,
        format(tuple.review_date.toString(), "yyyy-MM-dd HH:mm:ss"),
        tuple.rating,
        tuple.description,
        tuple.establishment_id,
      ]);
    }
    console.log(table.toString());

    // query the user if the establishment exists
    const establishmentIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment:",
        type: "input",
      },
    ]);

    // fetch the reviews on that establishment
    spinner = ora("Fetching your reviews...").start();
    const establishmentReviews = await conn.query(
      "SELECT * FROM review WHERE user_id=? AND establishment_id=?",
      [loginResponse.user.user_id, establishmentIdPrompt.id]
    );
    spinner.stop();

    // end if it does not exist
    if (establishmentReviews.length === 0) {
      console.log(chalk.blueBright("Establishment does not exist."));
      process.exit(0);
    }

    // show table of reviews to that establishment
    table = new CliTable3({
      head: [
        chalk.green("Review ID"),
        chalk.green("Review Date"),
        chalk.green("Rating"),
        chalk.green("Description"),
      ],
    });
    for (let tuple of establishmentReviews) {
      table.push([
        tuple.review_id,
        format(tuple.review_date.toString(), "yyyy-MM-dd HH:mm:ss"),
        tuple.rating,
        tuple.description,
      ]);
    }
    console.log(table.toString());

    // then select which review id to select
    const reviewIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Select the id of the review:",
        type: "input",
      },
    ]);

    // select that review
    spinner = ora("Fetching review...").start();
    const review = await conn.query(
      "SELECT * FROM review WHERE review_id=? AND user_id=? AND establishment_id=?",
      [reviewIdPrompt.id, loginResponse.user.user_id, establishmentIdPrompt.id]
    );
    spinner.stop();

    // end if it does not exist
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

    // update the review
    spinner = ora("Updating review...").start();
    await conn.query(
      "UPDATE review SET rating=?, description=? WHERE establishment_id=? AND user_id=?",
      [
        answers.rating,
        answers.description,
        establishmentIdPrompt.id,
        loginResponse.user.user_id,
      ]
    );
    spinner.stop();

    // confirm operation
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
