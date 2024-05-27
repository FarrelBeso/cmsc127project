import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Add a food establishment.
 */
export async function addEstab() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== 'admin') {
      throw "Only admin users can add a food establishment.";
    }

    // query the user for establishment details
    const answers = await inquirer.prompt([
      {
        name: "name",
        message: "Enter the name of the establishment:",
        type: "input",
      },
      {
        name: "location",
        message: "Enter the location of the establishment:",
        type: "input",
      },
      {
        name: "type",
        message: "Enter the type of food establishment:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Adding establishment...").start();
    // inserting into the database
    await conn.query(
      "INSERT INTO food_establishment (name, location, type) VALUES (?, ?, ?)",
      [answers.name, answers.location, answers.type]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.greenBright("Food establishment added successfully!"));

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
