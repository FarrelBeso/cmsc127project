import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Leave a review for a food item.
 */
export async function addReviewToItem() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success) {
      throw loginResponse.msg;
    }

    // first query the user if the food item exists
    const checkPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food item:",
        type: "input",
      },
    ]);
    const items = await conn.query(
      "SELECT * FROM food_item WHERE item_id=?",
      [checkPrompt.id]
    );

    if (items.length === 0) {
      throw "Food item does not exist.";
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
    const spinner = ora("Adding review...").start();
    // fetching all the food items from the database
    // only review the first food item
    await conn.query(
      "INSERT INTO review (rating, user_id, description, item_id) VALUES (?, ?, ?, ?)",
      [
        answers.rating,
        loginResponse.user.user_id,
        answers.description,
        items[0].item_id,
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
