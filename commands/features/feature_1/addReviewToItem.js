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
    // login
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    // fetch food items
    spinner = ora("Fetching food items...").start();
    const items = await conn.query("SELECT * FROM food_item");
    spinner.stop();

    // end if there are none to be rated
    if (items.length === 0) {
      console.log(chalk.blueBright("No food items yet."));
      process.exit(0);
    }

    // show table of items to be shown
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Price"),
        chalk.green("Availability"),
        chalk.green("Establishment ID"),
      ],
    });
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

    // fetch the food item
    spinner = ora("Fetching food item...").start();
    const item = await conn.query("SELECT * FROM food_item WHERE food_id=?", [
      foodIdPrompt.id,
    ]);
    spinner.stop();

    // end if there isnt a food item with that id
    if (item.length === 0) {
      console.log(chalk.blueBright("No food items yet."));
      process.exit(0);
    }

    // review info
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

    // add the review to db
    spinner = ora("Adding review...").start();
    await conn.query(
      "INSERT INTO review (rating, user_id, description, food_id) VALUES (?, ?, ?, ?)",
      [
        answers.rating,
        loginResponse.user.user_id,
        answers.description,
        item[0].food_id,
      ]
    );
    spinner.stop();

    // confirm that operation is done
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
