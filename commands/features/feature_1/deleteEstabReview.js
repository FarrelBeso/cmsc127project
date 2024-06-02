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
export async function deleteEstabReview() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    // get reviews made by user
    spinner = ora("Fetching your reviews...").start();
    const userReviews = await conn.query(
      "SELECT r.review_id, r.review_date, r.rating, r.description, r.establishment_id, e.name FROM review r \
      JOIN food_establishment e ON r.establishment_id=e.establishment_id \
      WHERE r.user_id=? AND e.establishment_id IS NOT NULL \
      ORDER BY e.name, r.review_date DESC",
      [loginResponse.user.user_id]
    );
    spinner.stop();

    // end if there are none
    if (userReviews.length === 0) {
      console.log(
        chalk.blueBright("You have no reviews made yet. Try adding one!")
      );
      process.exit(0);
    }

    // show table
    table = new CliTable3({
      head: [
        chalk.green("Establishment ID"),
        chalk.green("Establishment Name"),
        chalk.green("Review ID"),
        chalk.green("Review Date"),
        chalk.green("Rating"),
        chalk.green("Description"),
      ],
    });
    for (let tuple of userReviews) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.review_id,
        format(tuple.review_date.toString(), "yyyy-MM-dd HH:mm:ss"),
        tuple.rating,
        tuple.description,
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
      "SELECT * FROM review WHERE user_id=? AND establishment_id=? ORDER BY review_date DESC",
      [loginResponse.user.user_id, establishmentIdPrompt.id]
    );
    spinner.stop();

    // end if there aren't to be found
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

    // fetch that review
    spinner = ora("Fetching review...").start();
    const review = await conn.query(
      "SELECT * FROM review WHERE review_id=? AND user_id=? AND establishment_id=?",
      [reviewIdPrompt.id, loginResponse.user.user_id, establishmentIdPrompt.id]
    );
    spinner.stop();

    // end if there isn't that review
    if (review.length === 0) {
      console.log(chalk.blueBright("Review does not exist."));
      process.exit(0);
    }

    // delete review
    spinner = ora("Deleting review...").start();
    await conn.query("DELETE FROM review WHERE review_id = ?", [
      review[0].review_id,
    ]);
    spinner.stop();

    // operation confirm
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
