import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../db/connectDB.js";

/**
 * Get all reviews from an establishment.
 */
export async function getReviewsFromEstablishments() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first query the user on the id
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Fetching reviews from establishments...").start();
    // fetching all the establishments from the database
    const reviews = await conn.query(
      "SELECT * FROM review where establishment_id=?",
      [answers.id]
    );
    // stopping the spinner
    spinner.stop();

    // check if establishments exist or not
    if (reviews.length === 0) {
      console.log(chalk.blueBright("Reviews not found."));
    } else {
      console.log(reviews);
    }
    await disconnectDB(conn);
  } catch (error) {
    // Error Handling
    console.log("Something went wrong, Error: ", error);
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  // close the program
  process.exit(0);
}
