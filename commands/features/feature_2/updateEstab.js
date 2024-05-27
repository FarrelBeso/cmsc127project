import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a food establishment.
 */
export async function updateEstab() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== 'admin') {
      throw "Only admin users can update a food establishment.";
    }

    // query the user for establishment ID and new details
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment to update:",
        type: "input",
      },
      {
        name: "name",
        message: "Enter the new name of the establishment:",
        type: "input",
      },
      {
        name: "location",
        message: "Enter the new location of the establishment:",
        type: "input",
      },
      {
        name: "type",
        message: "Enter the new type of food establishment:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Updating establishment...").start();
    // updating the database
    await conn.query(
      "UPDATE food_establishment SET name = ?, location = ?, type = ? WHERE establishment_id = ?",
      [answers.name, answers.location, answers.type, answers.id]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.greenBright("Food establishment updated successfully!"));

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
