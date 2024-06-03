import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * View all food items from an establishment that belong to a food type {meat | veg | etc.}
 */
export async function getItemsFromEstabFoodType() {
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

    // loop while still asking for the food type
    let types = [];
    let foodTypePrompt = await inquirer.prompt([
      {
        name: "type",
        message: "Enter a food type:",
        type: "input",
      },
    ]);
    types.push(foodTypePrompt.type);
    // then ask the different types
    let isTypeAsking = true;
    while (isTypeAsking) {
      foodTypePrompt = await inquirer.prompt([
        {
          name: "type",
          message:
            "Enter an additional food type. Leave it blank if you're done:",
          type: "input",
        },
      ]);

      if (foodTypePrompt.type === "") {
        isTypeAsking = false;
      } else {
        types.push(foodTypePrompt.type);
      }
    }

    // then merge the types into one
    let typeString = types.reduce(
      (total, currVal) => total + `"${currVal},`,
      ""
    );
    // snip the last comma
    typeString = typeString.substring(0, typeString.length - 1);

    // starting the spinner
    spinner = ora("Fetching reviews from the food item...").start();
    const items = await conn.query(
      "SELECT f.food_id, f.name, f.price, f.availability, e.name establishment_name FROM food_item \
      JOIN food_establishment e ON f.establishment_id=e.establishment_id \
      WHERE (f.food_id IN (SELECT food_id FROM food_item_type WHERE type IN (?)) AND establishment_id=?)",
      [typeString, establishmentIdPrompt.id]
    );
    // stopping the spinner
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("Food items not found."));
      process.exit(0);
    }

    // show the tables otherwise
    // otherwise, show the item table
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
