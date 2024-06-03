import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all reviews from a food.
 */
export async function getItemsFromEstab() {
  let conn, spinner, table;
  try {
    // connect to db
    conn = await connectDB();

    // show all establishments first
    spinner = ora("Searching establishments...").start();
    const establishments = await conn.query(
      "SELECT * FROM food_establishment ORDER BY name"
    );
    spinner.stop();

    // exit if there are none
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
    for (let tuple of establishments) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.address,
        tuple.email,
      ]);
    }
    console.log(table.toString());

    const establishmentIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food establishment:",
        type: "input",
      },
    ]);

    // starting the spinner
    spinner = ora("Fetching food items from establishment...").start();
    const items = await conn.query(
      "SELECT * FROM food_item where establishment_id=?",
      [establishmentIdPrompt.id]
    );
    // stopping the spinner
    spinner.stop();

    // exit if there are none
    if (items.length === 0) {
      console.log(chalk.blueBright("No food items found."));
      process.exit(0);
    }

    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Price (PhP)"),
        chalk.green("Availability"),
        chalk.green("Establishment Name"),
      ],
    });
    for (let tuple of items) {
      table.push([
        tuple.food_id,
        tuple.name,
        tuple.price,
        tuple.availability === 1 ? "Available" : "Not Available",
        tuple.establishment_name,
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
