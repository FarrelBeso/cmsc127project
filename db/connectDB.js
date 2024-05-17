import mariadb from "mariadb";
import ora from "ora";
import chalk from "chalk";

const pool = mariadb.createPool({
  host: "localhost",
  user: "foodreviewer",
  password: "foodreview123",
  database: "food_reviewer",
  connectionLimit: 5,
});

export async function connectDB() {
  let conn;
  try {
    const spinner = ora("Connecting to the database...").start();
    conn = await pool.getConnection();
    spinner.stop();
    console.log(chalk.greenBright("Successfully connected to database."));
    return conn;
  } catch (error) {
    console.log(chalk.redBright("Error: "), error);
    process.exit(1);
  }
}

export async function disconnectDB(conn) {
  try {
    const spinner = ora("Disconnecting from the database...").start();
    conn.release();
    spinner.stop();
    console.log(chalk.greenBright("Successfully connected to database."));
  } catch (error) {
    console.log(chalk.redBright("Error: "), error);
    process.exit(1);
  }
}
