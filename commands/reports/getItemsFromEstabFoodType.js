import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * View all food items from an establishment that belong to a food type {meat | veg | etc.}
 */
export async function getItemsFromEstabFoodType() {
  let conn;
  try {
    let answers;
    // connect to db
    conn = await connectDB();
    answers = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the food establishment:",
        type: "input",
      },
    ]);
    const estabId = answers.id;

    // loop while still asking for the food type
    let types = [];
    answers = await inquirer.prompt([
      {
        name: "type",
        message: "Enter a food type:",
        type: "input",
      },
    ]);
    types.push(answers.type);
    // then ask the different types
    let isTypeAsking = true;
    while (isTypeAsking) {
      answers = await inquirer.prompt([
        {
          name: "type",
          message:
            "Enter an additional food type. Leave it blank if you're done:",
          type: "input",
        },
      ]);

      if (answers.type === "") {
        isTypeAsking = false;
      } else {
        types.push(answers.type);
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
    const spinner = ora("Fetching reviews from the food item...").start();
    const items = await conn.query(
      "SELECT * FROM food_item WHERE (food_id IN (SELECT food_id FROM food_item_type WHERE type IN (?)) AND establishment_id=?)",
      [typeString, estabId]
    );
    // stopping the spinner
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("Food items not found."));
    } else {
      console.log(items);
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
