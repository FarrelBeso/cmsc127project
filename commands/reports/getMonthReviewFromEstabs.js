import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * View all establishment reviews made within a month.
 */
export async function getMonthReviewFromEstabs(){
  let conn;
    try {
      // connect to db
      conn = await connectDB();
      const answers = await inquirer.prompt([
          {
              name: "id",
              message: "Enter the id of the food establishment:",
              type: "input",
          },
      ]); 
        
      // starting the spinner
      const spinner = ora("Fetching establishment reviews...").start();
      // getting all the establishment reviews made within 30 days
      const reviews = await conn.query("SELECT * FROM review WHERE (review_date >= CURDATE() - INTERVAL 30 DAY) AND establishment_id IS NOT NULL;",
                                       [answers.id]);
      // stopping the spinner
      spinner.stop();

      // check if review/s exist or not
      if (reviews.length === 0){
        console.log(chalk.blueBright("There is no review/s within the last 30 days."));
      } else {
          console.log(reviews);
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
