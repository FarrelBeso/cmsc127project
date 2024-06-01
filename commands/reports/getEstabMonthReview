import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * View all food reviews from a food item.
 */
export async function getReviewsFromItems() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first query the user on the id
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food item:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Fetching reviews from the food item...").start();
    // fetching all the reviews from the database
    const reviews = await conn.query("SELECT * FROM review where food_id=?", [
      answers.id,
    ]);
    // stopping the spinner
    spinner.stop();

    // check if reviews exist or not
    if (reviews.length === 0) {
      console.log(chalk.blueBright("Reviews not found."));
    } else {
      console.log(reviews);
    }
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
