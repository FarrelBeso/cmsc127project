import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";

/**
 * Search for a user.
 */
export async function updateUser() {
  let conn, table;
  try {
    // search query
    conn = await connectDB();
    const answers = await inquirer.prompt([
      {
        name: "searchTerm",
        message: "Search for the first name / last name / email of the user:",
        type: "input",
      },
    ]);

    // searching in the database
    const spinner = ora("Searching users...").start();
    const results = await conn.query(
      "SELECT * FROM user WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?",
      [
        `%${answers.searchTerm.toLowerCase()}%`,
        `%${answers.searchTerm.toLowerCase()}%`,
        `%${answers.searchTerm.toLowerCase()}%`,
      ]
    );
    spinner.stop();

    // exit early if there are none found
    if (results.length === 0) {
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
    for (let tuple of results) {
      table.push([
        tuple.user_id,
        tuple.first_name,
        tuple.last_name,
        tuple.usertype,
        tuple.email,
      ]);
    }
    console.log(table.toString());

    // finish
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
