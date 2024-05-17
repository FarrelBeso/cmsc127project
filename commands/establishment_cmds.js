import chalk from "chalk";
import ora from "ora";

export default async function getEstablishments(conn) {
  try {
    // starting the spinner
    const spinner = ora("Fetching all establishments...").start();
    // fetching all the establishments from the database
    const establishments = await conn.query("SELECT * FROM food_establishment");
    // stopping the spinner
    spinner.stop();

    // check if establishments exist or not
    if (establishments.length === 0) {
      console.log(chalk.blueBright("You do not have any tasks yet!"));
    } else {
      console.log(establishments);
    }
  } catch (error) {
    // Error Handling
    console.log("Something went wrong, Error: ", error);
    process.exit(1);
  }
}
