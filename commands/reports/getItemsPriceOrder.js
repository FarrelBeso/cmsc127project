import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get the food items from an establishment arranged according to price.
 */
export async function getItemsPriceOrder() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();

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

    // check
    const answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment:",
        type: "input",
        validate: function (value) {
          var valid = !isNaN(parseFloat(value));
          return valid || "Please enter a number.";
        },
        filter: Number,
      },
      {
        name: "sortOrder",
        message: "How would you like to arrange the food items by price?",
        type: "list",
        choices: ["ASC", "DESC"],
      },
    ]);
    // starting the spinner
    spinner = ora("Sorting and displaying food items...").start();

    const results = await conn.query(
      "SELECT * FROM food_item WHERE establishment_id=? ORDER BY price " +
        answers.sortOrder,
      [answers.id]
    );
    // stop the spinner
    spinner.stop();

    // show table here
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Price"),
        chalk.green("Availability"),
        chalk.green("Establishment ID"),
      ],
    });
    for (let tuple of results) {
      table.push([
        tuple.food_id,
        tuple.name,
        tuple.price,
        tuple.availability,
        tuple.establishment_id,
      ]);
    }
    console.log(table.toString());

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
