import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../auth_cmds.js";

/**
 * Update type to food.
 */
export async function updateFoodType() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
      throw "Only admin users can use this functionality.";
    }

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

    const typePrompt = await inquirer.prompt([
      {
        name: "type",
        message: "Enter the type:",
        type: "input",
      },
    ]);

    // double check if type doesn't exist
    if (!types.find((type) => type.type == typePrompt.type)) {
      console.log(chalk.magentaBright("Type does not exist."));
      process.exit(0);
    }

    // prompt change
    const typeChangePrompt = await inquirer.prompt([
      {
        name: "newType",
        message: "Enter updated type value:",
        type: "input",
      },
    ]);

    // insert to db
    spinner = ora("Updating type...").start();
    await conn.query(
      "UPDATE food_item_type SET type=? WHERE food_id=? AND type=?",
      [typeChangePrompt.newType, foodIdPrompt.id, typePrompt.type]
    );
    spinner.stop();

    // confirm operation
    console.log(chalk.greenBright("Type edited successfully!"));
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
