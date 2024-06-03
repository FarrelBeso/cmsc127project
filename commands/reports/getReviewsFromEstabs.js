import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { format } from "date-fns";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * View all food reviews from an establishment.
 */
export async function getReviewsFromEstabs() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();

    // show all establishments first
    spinner = ora("Searching establishments...").start();
    const establishments = await conn.query(
      "SELECT * FROM food_establishment ORDER BY name"
    );
    spinner.stop();

    // exit if there are none
    if (establishments.length === 0) {
      console.log(chalk.blueBright("No establishments found."));
      process.exit(0);
    }

    // show table here
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

    // first query the user on the id
    const establishmentIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment:",
        type: "input",
      },
    ]);

    // starting the spinner
    spinner = ora("Fetching reviews from establishments...").start();
    // fetching all the establishments from the database
    const reviews = await conn.query(
      "SELECT r.review_id, r.review_date, r.rating, r.description, u.first_name, u.last_name FROM review r \
      JOIN user u ON r.user_id=u.user_id \
      WHERE establishment_id=? ORDER BY review_date DESC",
      [establishmentIdPrompt.id]
    );
    // stopping the spinner
    spinner.stop();

    // exit if there are none
    if (reviews.length === 0) {
      console.log(chalk.blueBright("No reviews found."));
      process.exit(0);
    }

    // show table
    table = new CliTable3({
      head: [
        chalk.green("Review ID"),
        chalk.green("Review Date"),
        chalk.green("Rating"),
        chalk.green("Description"),
        chalk.green("Reviewer"),
      ],
    });
    for (let tuple of reviews) {
      table.push([
        tuple.review_id,
        format(tuple.review_date.toString(), "yyyy-MM-dd HH:mm:ss"),
        tuple.rating,
        tuple.description,
        `${tuple.first_name} ${tuple.last_name}`,
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
