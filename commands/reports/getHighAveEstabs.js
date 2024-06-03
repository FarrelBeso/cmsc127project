import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { connectDB, disconnectDB } from "../../db/connectDB.js";

/**
 * Get all establishments with a high average rating (4 and above).
 */
export async function getHighAveEstabs(){
  let conn;
    try {
      // connect to db
      conn = await connectDB();
      // starting the spinner
      const spinner = ora("Fetching all establishments...").start();
      // fetching all establishments from the database
      const establishments = await conn.query("SELECT e.establishment_id, e.name, e.address, e.email, r.average FROM food_establishment e JOIN (SELECT establishment_id, AVG(rating) `average` FROM review GROUP BY establishment_id HAVING establishment_id IS NOT NULL AND `average` >= 4) r ON e.establishment_id=r.establishment_id",
                                              [answers.id]);
                                              
      // stopping the spinner
      spinner.stop();

      // check if there are establishments with rating >= 4
      if (establishments.length === 0){
        console.log(chalk.blueBright("There are no establishments with high average rating."));
      } else {
        console.log(establishments);
      }
      await disconnectDB(conn);
    } catch (error) {
      // Error Handling
      console.log(chalk.redBright(`Something went wrong, Error: $(error)`));
      if (conn) await disconnectDB(conn);
      process.exit(1);
    }

  // close the program
  process.exit(0);
}
      

                                              
