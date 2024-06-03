import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { format } from "date-fns";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all reviews for an item within a month.
 */
export async function getMonthReviewFromItems() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();

    // show all food items first with the allergen
    spinner = ora("Fetching food items...").start();
    const items = await conn.query(
      "SELECT f.food_id, f.name, e.name establishment_name FROM food_item f \
      JOIN food_establishment e ON f.establishment_id=e.establishment_id \
      ORDER BY e.name, f.name"
    );
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("No food items yet."));
      process.exit(0);
    }

    // show the tables otherwise
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Establishment Name"),
      ],
    });
    for (let tuple of items) {
      table.push([tuple.food_id, tuple.name, tuple.establishment_name]);
    }
    console.log(table.toString());

    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food item:",
        type: "input",
      },
    ]);

    // starting the spinner
    spinner = ora("Fetching food item reviews...").start();
    // getting all the food item reviews made within 30 days
    const reviews = await conn.query(
      "SELECT * FROM review WHERE (review_date >= CURDATE() - INTERVAL 30 DAY) AND food_id = ?",
      [answers.id]
    );
    // stopping the spinner
    spinner.stop();

    // check if review/s exist or not
    if (reviews.length === 0) {
      console.log(
        chalk.blueBright(
          "There is no review/s for the item within the last 30 days."
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
        chalk.green("Food ID"),
        chalk.green("User ID"),
      ],
    });
    for (let tuple of reviews) {
      table.push([
        tuple.review_id,
        format(tuple.review_date.toString(), "yyyy-MM-dd HH:mm:ss"),
        tuple.rating,
        tuple.description,
        tuple.food_id,
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
