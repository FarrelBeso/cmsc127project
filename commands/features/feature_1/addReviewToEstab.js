import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Leave a review to an establishment.
 */
export async function addReviewToEstab() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    spinner = ora("Fetching establishments...").start();

    // first get all establishments available to review
    const establishments = await conn.query("SELECT * FROM food_establishment");

    spinner.stop();

    if (establishments.length === 0) {
      console.log(chalk.blueBright("No establishments yet."));
      process.exit(0);
    }

    table = new CliTable3({
      head: [
        chalk.green("Establishment ID"),
        chalk.green("Name"),
        chalk.green("Address"),
        chalk.green("Email"),
      ],
    });

    // loop for all items
    for (let tuple of establishments) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.address,
        tuple.email,
      ]);
    }

    console.log(table.toString());

    // first query the user if the establishment exists
    const establishmentIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment:",
        type: "input",
      },
    ]);

    spinner = ora("Fetching establishment...").start();

    const establishment = await conn.query(
      "SELECT * FROM food_establishment where establishment_id=?",
      [establishmentIdPrompt.id]
    );

    spinner.stop();

    if (establishment.length === 0) {
      console.log(chalk.blueBright("Establishment does not exist."));
      process.exit(0);
    }

    const answers = await inquirer.prompt([
      {
        name: "rating",
        message: "Review rating:",
        type: "input",
      },
      {
        name: "description",
        message: "Review description:",
        type: "input",
      },
    ]);

    // starting the spinner
    spinner = ora("Adding review...").start();
    // fetching all the establishments from the database
    // only review the first establishment
    await conn.query(
      "INSERT INTO review (rating, user_id, description, establishment_id) VALUES (?, ?, ?, ?)",
      [
        answers.rating,
        loginResponse.user.user_id,
        answers.description,
        establishment[0].establishment_id,
      ]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.blueBright("Review added!"));

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
