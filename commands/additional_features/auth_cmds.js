import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import bcrypt from "bcrypt";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Register a user.
 */
export async function register() {
  let conn, spinner;
  try {
    // connect to db
    conn = await connectDB();
    // first check if email already exists due to uniqueness constraint
    const emailPrompt = await inquirer.prompt([
      {
        name: "email",
        message: "Enter your email:",
        type: "input",
      },
    ]);

    // then fetch to check if there already is an email for that
    spinner = ora("Creating account...").start();
    const emailCheck = await conn.query("SELECT FROM user WHERE email=?", [
      emailPrompt.email,
    ]);
    spinner.stop();

    // exit if there is duplicate
    if (emailCheck.length > 0) {
      console.log(chalk.magentaBright("Email already exists."));
      process.exit(0);
    }

    // then proceed with asking more info
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
        name: "password",
        message: "Enter your password:",
        type: "password", // This will hide the password input
      },
      {
        name: "confirmPassword",
        message: "Confirm your password:",
        type: "password",
      },
    ]);

    // Check if passwords match
    if (answers.password !== answers.confirmPassword) {
      throw "Passwords do not match.";
    }

    // starting the spinner
    spinner = ora("Creating account...").start();
    // creating account
    // hash the password first
    const hashedPassword = await bcrypt.hash(answers.password, 10);
    await conn.query(
      "INSERT INTO user (first_name, last_name, usertype, email, hashed_password) VALUES(?, ?, ?, ?, ?)",
      [
        answers.firstName,
        answers.lastName,
        "user",
        emailPrompt.email,
        hashedPassword,
      ]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.greenBright("Account created successfully!"));

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

/**
 * User Login
 *
 * Requires the conn parameter to avoid overhead.
 * Returns a boolean whether the login is successful or not.
 * If successful: return {success: true, user: <user info>}
 * If not: return {success: false, msg: <error message>}
 */
export async function login(conn) {
  try {
    console.log(chalk.yellowBright("This operation requires authentication."));
    const emailInput = await inquirer.prompt([
      {
        name: "email",
        message: "Enter your email:",
        type: "input",
      },
    ]);
    // starting the spinner
    const spinner = ora("Fetching user info...").start();
    // check if password is correct
    const response = await conn.query("SELECT * FROM user WHERE email=?", [
      emailInput.email,
    ]);
    // stopping the spinner
    spinner.stop();

    // if there are no response, then throw an error
    if (response.length === 0) {
      throw "User does not exist.";
    }
    const passInput = await inquirer.prompt([
      {
        name: "password",
        message: "Enter your password:",
        type: "password", // This will hide the password input
      },
    ]);
    // just get the first one
    const isPasswordValid = await bcrypt.compare(
      passInput.password,
      response[0].hashed_password
    );
    if (!isPasswordValid) {
      throw "Invalid password.";
    }

    console.log(chalk.greenBright("Login successful!"));

    return { success: true, user: response[0] };
  } catch (error) {
    return { success: false, msg: error };
  }
}
