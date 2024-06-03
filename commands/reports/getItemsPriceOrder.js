import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * View the food items from an establishment arranged according to price.
 */
export async function getItemsPriceOrder() {
  let conn;
  try {
    // connect to db
    conn = await connectDB()
      // Ask user whether to arrange price list in increasing or decreasing order
      const validSortOrder = sort === "DESC" ? "DESC" : "ASC";
      // check
      const item = await inquirer.prompt([
        {
          name: "id",
          message: "Enter the id of the establishment:",
          type: "input",
          validate: function(value) {
            var valid = !isNaN(parseFloat(value));
            return valid || "Please enter a number.";
          },
          filter: Number
        },
        {
          name: "sortOrder",
          message: "How would you like to arrange the food items by price?",
          type: "list",
          choices: ["ASC","DESC"]
        },
      ]);
      // starting the spinner
      const spinner = ora("Sorting and displaying food items...").start();
      const foodItem = await conn.query("SELECT * FROM food_item WHERE establishment_id=? ORDER BY price ?" + foodItem.sortOrder,
                                        [foodItem.id]
      );
      // stop the spinner
      spinner.stop();
                
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
