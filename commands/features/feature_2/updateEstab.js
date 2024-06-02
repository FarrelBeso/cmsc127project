import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../../additional_features/auth_cmds.js";

/**
 * Update a food establishment.
 */
export async function updateEstab() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
      throw "Only admin users can update a food establishment.";
    }

    // show all establishments first
    spinner = ora("Searching establishments...").start();
    const establishments = await conn.query(
      "SELECT * FROM food_establishment ORDER BY name"
    );
    spinner.stop();

    // exit early if none found
    if (establishments.length === 0) {
      console.log(chalk.blueBright("No establishments found."));
      process.exit(0);
    }

    // show table here
    table = new CliTable3({
      head: [
        chalk.green("Establishment ID"),
        chalk.green("Name"),
        chalk.green("Address"),
        chalk.green("Email"),
      ],
    });
    for (let tuple of establishments) {
      table.push([
        tuple.establishment_id,
        tuple.name,
        tuple.address,
        tuple.email,
      ]);
    }
    console.log(table.toString());

    // query the user for establishment ID
    const establishmentIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter the id of the establishment to update:",
        type: "input",
      },
    ]);

    // get that establishment
    spinner = ora("Fetching establishment...").start();
    const establishment = await conn.query(
      "SELECT * FROM food_establishment where establishment_id=?",
      [establishmentIdPrompt.id]
    );
    spinner.stop();

    // end program if that establishment doesn't exist
    if (establishment.length === 0) {
      console.log(chalk.blueBright("Establishment does not exist."));
      process.exit(0);
    }

    // update data
    const answers = await inquirer.prompt([
      {
        name: "name",
        message: "Enter the new name of the establishment:",
        type: "input",
      },
      {
        name: "address",
        message: "Enter the new address of the establishment:",
        type: "input",
      },
      {
        name: "email",
        message: "Enter the new email of food establishment:",
        type: "input",
      },
    ]);

    // update the document
    spinner = ora("Updating establishment...").start();
    await conn.query(
      "UPDATE food_establishment SET name = ?, address = ?, email = ? WHERE establishment_id = ?",
      [answers.name, answers.address, answers.email, establishmentIdPrompt.id]
    );
    spinner.stop();

    // operation confirm
    console.log(chalk.greenBright("Food establishment updated successfully!"));
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
