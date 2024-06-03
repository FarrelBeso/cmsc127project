import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { format } from "date-fns";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all reviews for an establishment within a month.
 */
export async function getMonthReviewFromEstabs() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();

    // show all food establishments first
    spinner = ora("Fetching food establishments...").start();
    const establishments = await conn.query(
      "SELECT * from food_establishment ORDER BY name"
    );
    spinner.stop();

    if (establishments.length === 0) {
      console.log(chalk.blueBright("No establishments yet."));
      process.exit(0);
    }

    // show the tables otherwise
    table = new CliTable3({
      head: [
        chalk.green("Establishment ID"),
        chalk.green("Name"),
        chalk.green("Address"),
        chalk.green("Email"),
      ],
    });
    for (let tuple of establishments) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.address,
        tuple.email,
      ]);
    }
    console.log(table.toString());

    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food establishment:",
        type: "input",
      },
    ]);

    // starting the spinner
    spinner = ora("Fetching establishment reviews...").start();
    // getting all the establishment reviews made within 30 days
    const reviews = await conn.query(
      "SELECT * FROM review WHERE (review_date >= CURDATE() - INTERVAL 30 DAY) AND establishment_id = ?",
      [answers.id]
    );
    // stopping the spinner
    spinner.stop();

    // check if review/s exist or not
    if (reviews.length === 0) {
      console.log(
        chalk.blueBright(
          "There is no review/s for the establishment within the last 30 days."
        )
      );
      process.exit(0);
    }

    // show table here
    table = new CliTable3({
      head: [
        chalk.green("Review ID"),
        chalk.green("Review Date"),
        chalk.green("Rating"),
        chalk.green("Description"),
        chalk.green("Establishment ID"),
        chalk.green("User ID"),
      ],
    });
    for (let tuple of reviews) {
      table.push([
        tuple.review_id,
        format(tuple.review_date.toString(), "yyyy-MM-dd HH:mm:ss"),
        tuple.rating,
        tuple.description,
        tuple.establishment_id,
        tuple.user_id,
      ]);
    }
    console.log(table.toString());

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
