import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Delete a user.
 */
export async function deleteUser() {
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
        message: "Enter the id of the user to delete:",
        type: "input",
      },
    ]);

    // deleting the document
    spinner = ora("Deleting user...").start();
    await conn.query("DELETE FROM user WHERE user_id = ?", [userIdPrompt.id]);
    spinner.stop();

    // operation confirm
    console.log(chalk.greenBright("User deleted successfully!"));
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
