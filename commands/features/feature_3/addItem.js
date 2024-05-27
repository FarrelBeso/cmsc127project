import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Add a food item.
 */
export async function addItem() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== 'admin') {
      throw "Only admin users can add a food item.";
    }

    // query the user for food item details
    const answers = await inquirer.prompt([
      {
        name: "name",
        message: "Enter the name of the food item:",
        type: "input",
      },
      {
        name: "price",
        message: "Enter the price of the food item:",
        type: "input",
      },
      {
        name: "type",
        message: "Enter the type of food item:",
        type: "input",
      },
      {
        name: "establishmentId",
        message: "Enter the establishment ID:",
        type: "input",
      },
      {
        name: "availability",
        message: "Is the item available (true/false)?",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Adding food item...").start();
    // inserting into the database
    await conn.query(
      "INSERT INTO food_item (name, price, type, establishment_id, availability) VALUES (?, ?, ?, ?, ?)",
      [answers.name, answers.price, answers.type, answers.establishmentId, answers.availability === 'true']
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.greenBright("Food item added successfully!"));

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
