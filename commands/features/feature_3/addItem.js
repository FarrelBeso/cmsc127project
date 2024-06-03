import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Add a food item.
 */
export async function addItem() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();
    // first try to login
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
      throw "Only admin users can add a food item.";
    }

    // show all food establishments first
    spinner = ora("Fetching food establishments...").start();
    const establishments = await conn.query(
      "SELECT * from food_establishment ORDER BY name"
    );
    spinner.stop();

    if (establishments.length === 0) {
      console.log(chalk.blueBright("No establishments yet."));
      process.exit(0);
    }

    // show the tables otherwise
    table = new CliTable3({
      head: [
        chalk.green("Establishment ID"),
        chalk.green("Name"),
        chalk.green("Address"),
        chalk.green("Email"),
      ],
    });
    for (let tuple of establishments) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.address,
        tuple.email,
      ]);
    }
    console.log(table.toString());

    // query the user for food item details
    const answers = await inquirer.prompt([
      {
        name: "establishmentId",
        message: "Enter the establishment ID of the food item:",
        type: "input",
      },
      {
        name: "name",
        message: "Enter the name of the food item:",
        type: "input",
      },
      {
        name: "price",
        message: "Enter the price of the food item:",
        type: "input",
      },
      // {
      //   name: "type",
      //   message: "Enter the type of food item:",
      //   type: "input",
      // },
      {
        name: "availability",
        message: "Is the item available?",
        type: "confirm",
      },
    ]);

    // starting the spinner
    spinner = ora("Adding food item...").start();
    // inserting into the database
    await conn.query(
      "INSERT INTO food_item (name, price, establishment_id, availability) VALUES (?, ?, ?, ?)",
      [
        answers.name,
        answers.price,
        // answers.type,
        answers.establishmentId,
        answers.availability,
      ]
    );
    // stopping the spinner
    spinner.stop();

    console.log(chalk.greenBright("Food item added successfully!"));

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
