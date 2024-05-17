import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../db/connectDB.js";
import { login } from "./auth_cmds.js";

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

/**
 * Leave a review to an establishment.
 */
export async function postReviewToEstablishment() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }
    // first query the user if the establishment exists
    const checkPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment:",
        type: "input",
      },
    ]);
    const establishments = await conn.query(
      "SELECT * FROM food_establishment where establishment_id=?",
      [checkPrompt.id]
    );

    if (establishments.length === 0) {
      throw "Establishment does not exist.";
    }

    // // then we can now query for the review info
    // const answers = await inquirer.prompt([
    //     {
    //       name: "rating",
    //       message: "Enter your rating for the :",
    //       type: "input",
    //     },
    //   ]);

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
