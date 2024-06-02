import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { format } from "date-fns";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a review for a food item.
 */
export async function updateItemReview() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    // get reviews
    spinner = ora("Fetching your reviews...").start();
    const userReviews = await conn.query(
      "SELECT r.review_id, r.review_date, r.rating, r.description, r.establishment_id, f.name FROM review r \
      JOIN food_item f ON r.food_id=f.food_id \
      WHERE r.user_id=? AND f.food_id IS NOT NULL \
      ORDER BY f.name",
      [loginResponse.user.user_id]
    );
    spinner.stop();

    // end if you have no reviews yet on items
    if (userReviews.length === 0) {
      console.log(
        chalk.blueBright("You have no reviews made yet. Try adding one!")
      );
      process.exit(0);
    }

    // show table of user's reviews on items
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Food Name"),
        chalk.green("Review ID"),
        chalk.green("Review Date"),
        chalk.green("Rating"),
        chalk.green("Description"),
      ],
    });
    for (let tuple of userReviews) {
      table.push([
        tuple.food_id,
        tuple.name,
        tuple.review_id,
        format(tuple.review_date.toString(), "yyyy-MM-dd HH:mm:ss"),
        tuple.rating,
        tuple.description,
      ]);
    }
    console.log(table.toString());

    // query the user if the food item exists
    const foodIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Select the id of the food item:",
        type: "input",
      },
    ]);

    // get the reviews
    spinner = ora("Fetching your reviews...").start();
    const foodReviews = await conn.query(
      "SELECT * FROM review WHERE user_id=? AND food_id=? ORDER BY review_date DESC",
      [loginResponse.user.user_id, foodIdPrompt.id]
    );
    spinner.stop();

    // end if that food item does not exist
    if (foodReviews.length === 0) {
      console.log(chalk.blueBright("Food item does not exist."));
      process.exit(0);
    }

    // show the reviews on that item
    table = new CliTable3({
      head: [
        chalk.green("Review ID"),
        chalk.green("Review Date"),
        chalk.green("Rating"),
        chalk.green("Description"),
      ],
    });
    for (let tuple of foodReviews) {
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

    // fetch the review on that review id
    spinner = ora("Fetching review...").start();
    const review = await conn.query(
      "SELECT * FROM review WHERE review_id=? AND user_id=? AND food_id=?",
      [reviewIdPrompt.id, loginResponse.user.user_id, foodIdPrompt.id]
    );
    spinner.stop();

    // end if review does not exist
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

    // update review
    spinner = ora("Updating review...").start();
    await conn.query(
      "UPDATE review SET rating=?, description=? WHERE food_id=? AND user_id=?",
      [
        answers.rating,
        answers.description,
        foodIdPrompt.id,
        loginResponse.user.user_id,
      ]
    );
    spinner.stop();

    // operation confirm
    console.log(chalk.blueBright("Review updated!"));
    await disconnectDB(conn);
  } catch (error) {
    // Error Handling
    console.log(chalk.redBright(`Error: ${error}`));
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  // close the program
  process.exit(0);
}
