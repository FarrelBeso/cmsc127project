import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Delete a food establishment.
 */
export async function deleteEstab() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
      throw "Only admin users can delete a food establishment.";
    }

    // show all establishments first
    // starting the spinner
    spinner = ora("Searching establishments...").start();
    // searching in the database
    const establishments = await conn.query(
      "SELECT * FROM food_establishment ORDER BY name"
    );
    // stopping the spinner
    spinner.stop();

    if (establishments.length === 0) {
      console.log(chalk.blueBright("No establishments found."));
      process.exit(0);
    }

    // show table here
    table = new CliTable3({
      head: [
        chalk.green("Establishment ID"),
        chalk.green("Name"),
        chalk.green("Address"),
        chalk.green("Email"),
      ],
    });
    // loop for all items
    for (let tuple of establishments) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.address,
        tuple.email,
      ]);
    }
    console.log(table.toString());

    // query the user for establishment ID
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment to delete:",
        type: "input",
      },
    ]);

    // deleting related reviews
    spinner = ora("Dereferencing related reviews...").start();
    await conn.query(
      "UPDATE FROM review SET establishment_id=NULL WHERE establishment_id = ?",
      [answers.id]
    );
    spinner.stop();

    // delete the establishment itself
    spinner = ora("Deleting establishment...").start();
    await conn.query(
      "DELETE FROM food_establishment WHERE establishment_id = ?",
      [answers.id]
    );
    spinner.stop();

    console.log(chalk.greenBright("Food establishment deleted successfully!"));

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
