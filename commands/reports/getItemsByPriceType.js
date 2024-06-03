import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all food items belonging to the specified type and within a set price range.
 */
export async function getItemsByPriceType() {
  let conn;
  try {
    // connect to db
    conn = await connectDB();

    // query the user for search term
    const answers = await inquirer.prompt([
      {
        name: "minPrice",
        message: "Enter the type of the food item to search:",
        type: "input",
      },
      {
        name: "maxPrice",
        message: "Enter the type of the food item to search:",
        type: "input",
      },
      {
        name: "itemType",
        message: "Enter the type of the food item to search:",
        type: "input",
      },
    ]);

    // starting the spinner
    const spinner = ora("Searching food item...").start();
    // searching in the database
    const results = await conn.query(
      "SELECT * FROM food_item WHERE price >= ? AND price <= ? AND food_id IN (SELECT food_id FROM food_item_type WHERE type IN ?", 
      [answers.minPrice,answers.maxPrice,addItems.type]
    );
    // stopping the spinner
    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.redBright("No food items found."));
    } else {
      console.log(chalk.greenBright("Food items found:"));
      results.forEach(item => {
        console.log(`- ${item.name}, ${item.price}`);
      });
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
