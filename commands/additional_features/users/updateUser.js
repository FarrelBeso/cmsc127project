import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a user.
 */
export async function updateUser() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
      throw "Only admin users can update users.";
    }

    // show all users first
    spinner = ora("Searching users...").start();
    const users = await conn.query("SELECT * FROM user ORDER BY last_name");
    spinner.stop();

    // exit early if none found
    if (users.length === 0) {
      console.log(chalk.blueBright("No users found."));
      process.exit(0);
    }

    // show table here
    table = new CliTable3({
      head: [
        chalk.green("User ID"),
        chalk.green("First Name"),
        chalk.green("Last Name"),
        chalk.green("User Type"),
        chalk.green("Email"),
      ],
    });
    for (let tuple of users) {
      table.push([
        tuple.user_id,
        tuple.first_name,
        tuple.last_name,
        tuple.usertype,
        tuple.email,
      ]);
    }
    console.log(table.toString());

    // query the user for user ID
    const userIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the user to update:",
        type: "input",
      },
    ]);

    // get that user
    spinner = ora("Fetching user...").start();
    const user = await conn.query("SELECT * FROM user where user_id=?", [
      userIdPrompt.id,
    ]);
    spinner.stop();

    // end program if that user doesn't exist
    if (user.length === 0) {
      console.log(chalk.blueBright("User does not exist."));
      process.exit(0);
    }

    // update data
    const answers = await inquirer.prompt([
      {
        name: "first_name",
        message: "Enter the new first name of the user:",
        type: "input",
      },
      {
        name: "last_name",
        message: "Enter the new last name of the user:",
        type: "input",
      },
      {
        name: "email",
        message: "Enter the new email of the user:",
        type: "input",
      },
    ]);

    // update the document
    spinner = ora("Updating user...").start();
    await conn.query(
      "UPDATE user SET first_name = ?, last_name = ?, email = ? WHERE user_id = ?",
      [answers.first_name, answers.last_name, answers.email, userIdPrompt.id]
    );
    spinner.stop();

    // operation confirm
    console.log(chalk.greenBright("User updated successfully!"));
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
