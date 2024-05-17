import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import bcrypt from "bcrypt";
import { connectDB, disconnectDB } from "../db/connectDB.js";

// TODO: Do not directly display the password when typing it
// TODO: Password should be entered twice
/**
 * Register a user.
 */
export default async function register() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();
    // first query the user on the id
    const answers = await inquirer.prompt([
      {
        name: "firstName",
        message: "Enter your first name:",
        type: "input",
      },
      {
        name: "lastName",
        message: "Enter your last name:",
        type: "input",
      },
      {
        name: "email",
        message: "Enter your email:",
        type: "input",
      },
      {
        name: "password",
        message: "Enter your password:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Creating account...").start();
    // creating account
    // hash the password first
    const hashedPassword = bcrypt.hash(answers.password, 10);
    await conn.query(
      "INSERT INTO user (first_name, last_name, usertype, email, hashed_password) VALUES(?, ?, ?, ?, ?)",
      [
        answers.firstName,
        answers.lastName,
        "user",
        answers.email,
        hashedPassword,
      ]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.greenBright("Account created successfully!"));

    await disconnectDB(conn);
  } catch (error) {
    // Error Handling
    console.log("Something went wrong, Error: ", error);
    if (conn) await disconnectDB(conn);
    process.exit(1);
  }

  // close the program
  process.exit(0);
}
