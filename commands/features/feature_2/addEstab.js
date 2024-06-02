import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Add a food establishment.
 */
export async function addEstab() {
  let conn;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
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
        name: "address",
        message: "Enter the address of the establishment:",
        type: "input",
      },
      {
        name: "email",
        message: "Enter the email of food establishment:",
        type: "input",
      },
    ]);

    // insert to db
    const spinner = ora("Adding establishment...").start();
    await conn.query(
      "INSERT INTO food_establishment (name, address, email) VALUES (?, ?, ?)",
      [answers.name, answers.address, answers.email]
    );
    spinner.stop();

    // confirm operation
    console.log(chalk.greenBright("Food establishment added successfully!"));
    await disconnectDB(conn);
  } catch (error) {
    // Error Handling
    console.log(chalk.redBright(`Error: ${error}`));
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  // close the program
  process.exit(0);
}
