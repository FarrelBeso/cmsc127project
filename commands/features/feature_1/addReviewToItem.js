import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Leave a review for a food item.
 */
export async function addReviewToItem() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    spinner = ora("Fetching food items...").start();

    // first get all establishments available to review
    const items = await conn.query("SELECT * FROM food_item");

    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("No food items yet."));
      process.exit(0);
    }

    table = new CliTable3({
      head: ["Food ID", "Name", "Price", "Availability", "Establishment ID"],
    });

    // loop for all items
    for (let tuple of items) {
      table.push([
        tuple.food_id,
        tuple.name,
        tuple.price,
        tuple.availability === 1 ? "Available" : "Not Available",
        tuple.establishment_id,
      ]);
    }

    console.log(table.toString());

    // first query the user if the food item exists
    const foodIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food item:",
        type: "input",
      },
    ]);

    spinner = ora("Fetching food item...").start();

    const item = await conn.query("SELECT * FROM food_item WHERE food_id=?", [
      foodIdPrompt.id,
    ]);

    spinner.stop();

    if (item.length === 0) {
      console.log(chalk.blueBright("No food items yet."));
      process.exit(0);
    }

    // then we can now query for the review info
    // TODO: Review description should be optional
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
    // fetching all the food items from the database
    // only review the first food item
    await conn.query(
      "INSERT INTO review (rating, user_id, description, food_id) VALUES (?, ?, ?, ?)",
      [
        answers.rating,
        loginResponse.user.user_id,
        answers.description,
        item[0].food_id,
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
