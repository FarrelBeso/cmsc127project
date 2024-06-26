import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";

/**
 * Search food.
 */
export async function searchFoodType() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();

    // show all food items first with the type
    spinner = ora("Fetching food items...").start();
    const items = await conn.query(
      "SELECT f.food_id, f.name, e.name establishment_name FROM food_item f \
      JOIN food_establishment e ON f.establishment_id=e.establishment_id \
      ORDER BY e.name, f.name"
    );
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.blueBright("No food items yet."));
      process.exit(0);
    }

    // show the tables otherwise
    table = new CliTable3({
      head: [
        chalk.green("Food ID"),
        chalk.green("Name"),
        chalk.green("Establishment Name"),
      ],
    });
    for (let tuple of items) {
      table.push([tuple.food_id, tuple.name, tuple.establishment_name]);
    }
    console.log(table.toString());

    const foodIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter food id:",
        type: "input",
      },
    ]);

    // check if there is food id in the fetched items
    if (!items.find((item) => item.food_id == foodIdPrompt.id)) {
      console.log(chalk.magentaBright("Food id not found."));
      process.exit(0);
    }

    // show the types of the id
    spinner = ora("Fetching types...").start();
    const types = await conn.query(
      "SELECT type FROM food_item_type WHERE food_id=?",
      [foodIdPrompt.id]
    );
    spinner.stop();

    // show the tables otherwise
    table = new CliTable3({
      head: [chalk.green("Type")],
    });
    for (let tuple of types) {
      table.push([tuple.type]);
    }
    console.log(table.toString());

    if (types.length === 0) {
      console.log(chalk.blueBright("No types yet."));
    }

    // confirm operation
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
