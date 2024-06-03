import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all reviews for an establishment within a month.
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
      const reviews = await conn.query("SELECT * FROM review WHERE (review_date >= CURDATE() - INTERVAL 30 DAY) AND establishment_id = ?",
                                       [answers.id]);
      // stopping the spinner
      spinner.stop();

      // check if review/s exist or not
      if (reviews.length === 0){
        console.log(chalk.blueBright("There is no review/s for the establishment within the last 30 days."));
      } else {
          console.log(reviews);
        }

      // show table here
      table = new CliTable3({
        head: [
          chalk.green("Establishment ID"),
          chalk.green("Review Date"),
          chalk.green("Review ID"),
          chalk.green("User ID"),
          chalk.green("Rating"),
          chalk.green("Description")
        ],
      });
      for (let tuple of reviews) {
        table.push([
          tuple.establishment_id,
          tuple.review_date,
          tuple.review_id,
          tuple.user_id,
          tuple.rating,
          tuple.description,
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
