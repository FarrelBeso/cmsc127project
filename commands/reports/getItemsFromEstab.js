import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../db/connectDB.js";

/**
 * Get all reviews from a food.
 */
export async function getItemsFromEstab() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food establishment:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Fetching reviews from the food item...").start();
    const items = await conn.query(
      "SELECT * FROM food_item where establishment_id=?",
      [answers.id]
    );
    // stopping the spinner
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("Food items not found."));
    } else {
      console.log(items);
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
