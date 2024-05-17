import mariadb from "mariadb";
import chalk from "chalk";
import ora from "ora";

/**
 * Get all reviews from an establishment.
 *
 * id: the id of the establishment
 *
 * Params example:
 * {
 *  id: 123
 * }
 * @param {mariadb.PoolConnection} conn
 * @param params
 */
export default async function getReviewsFromEstablishments(conn, params) {
  try {
    // deconstruct parameters
    const { id } = params;
    // starting the spinner
    const spinner = ora("Fetching reviews from establishments...").start();
    // fetching all the establishments from the database
    const reviews = await conn.query(
      "SELECT * FROM review where establishment_id=?",
      [id]
    );
    // stopping the spinner
    spinner.stop();

    // check if establishments exist or not
    if (reviews.length === 0) {
      console.log(chalk.blueBright("Reviews not found."));
    } else {
      console.log(reviews);
    }
  } catch (error) {
    // Error Handling
    console.log("Something went wrong, Error: ", error);
    process.exit(1);
  }
}
