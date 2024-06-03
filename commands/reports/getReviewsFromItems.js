import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { format } from "date-fns";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * View all food reviews from a food item.
 */
export async function getReviewsFromItems() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();

    // get all items first
    spinner = ora("Fetching all food items...").start();
    const items = await conn.query(
      "SELECT f.food_id, f.name, f.price, f.availability, e.name establishment_name FROM food_item f \
JOIN food_establishment e ON f.establishment_id=e.establishment_id \
ORDER BY e.name, f.name"
    );
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("Food items not found."));
      process.exit(0);
    }

    // otherwise, show the item table
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Price (PhP)"),
        chalk.green("Availability"),
        chalk.green("Establishment Name"),
      ],
    });
    for (let tuple of items) {
      table.push([
        tuple.food_id,
        tuple.name,
        tuple.price,
        tuple.availability === 1 ? "Available" : "Not Available",
        tuple.establishment_name,
      ]);
    }
    console.log(table.toString());

    // first query the user on the id
    const itemIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food item:",
        type: "input",
      },
    ]);

    // starting the spinner
    spinner = ora("Fetching reviews from food items...").start();
    const reviews = await conn.query(
      "SELECT r.review_id, r.review_date, r.rating, r.description, u.first_name, u.last_name FROM review r \
     JOIN user u ON r.user_id=u.user_id \
     WHERE food_id=? ORDER BY review_date DESC",
      [itemIdPrompt.id]
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
