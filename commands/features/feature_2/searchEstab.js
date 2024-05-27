import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";

/**
 * Search for a food establishment.
 */
export async function searchEstab() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();

    // query the user for search term
    const answers = await inquirer.prompt([
      {
        name: "searchTerm",
        message: "Enter the name or location of the establishment to search:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Searching establishment...").start();
    // searching in the database
    const results = await conn.query(
      "SELECT * FROM food_establishment WHERE name LIKE ? OR location LIKE ?",
      [`%${answers.searchTerm}%`, `%${answers.searchTerm}%`]
    );
    // stopping the spinner
    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.redBright("No establishments found."));
    } else {
      console.log(chalk.greenBright("Establishments found:"));
      results.forEach(establishment => {
        console.log(`- ${establishment.name}, ${establishment.location}, ${establishment.type}`);
      });
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
