import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Delete allergen from food.
 */
export async function deleteAllergen() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
      throw "Only admin users can use this functionality.";
    }

    // show all food items first with the allergen
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

    // show the allergens of the id
    spinner = ora("Fetching allergens...").start();
    const allergens = await conn.query(
      "SELECT allergen FROM food_item_allergen WHERE food_id=?",
      [foodIdPrompt.id]
    );
    spinner.stop();

    // show the tables otherwise
    table = new CliTable3({
      head: [chalk.green("Allergen")],
    });
    for (let tuple of allergens) {
      table.push([tuple.allergen]);
    }
    console.log(table.toString());

    if (allergens.length === 0) {
      console.log(chalk.blueBright("No allergens yet."));
      process.exit(0);
    }

    const allergenPrompt = await inquirer.prompt([
      {
        name: "allergen",
        message: "Enter the allergen:",
        type: "input",
      },
    ]);

    // double check if allergen doesn't exist
    if (
      !allergens.find(
        (allergen) => allergen.allergen == allergenPrompt.allergen
      )
    ) {
      console.log(chalk.magentaBright("Allergen does not exist."));
      process.exit(0);
    }

    // delete to db
    spinner = ora("Delete allergen...").start();
    await conn.query(
      "DELETE FROM food_item_allergen WHERE food_id=? AND allergen=?",
      [foodIdPrompt.id, allergenPrompt.allergen]
    );
    spinner.stop();

    // confirm operation
    console.log(chalk.greenBright("Allergen deleted successfully!"));
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
