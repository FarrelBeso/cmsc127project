import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";

/**
 * Search contact number.
 */
export async function searchContactNum() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();

    // show all food establishments first
    spinner = ora("Fetching food establishments...").start();
    const establishments = await conn.query(
      "SELECT * from food_establishment ORDER BY name"
    );
    spinner.stop();

    if (establishments.length === 0) {
      console.log(chalk.blueBright("No establishments yet."));
      process.exit(0);
    }

    // show the tables otherwise
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

    const establishmentIdPrompt = await inquirer.prompt([
      {
        name: "id",
        message: "Enter establishment id:",
        type: "input",
      },
    ]);

    // check if there is establishment id
    if (
      !establishments.find(
        (establishment) =>
          establishment.establishment_id == establishmentIdPrompt.id
      )
    ) {
      console.log(chalk.magentaBright("Establishment id not found."));
      process.exit(0);
    }

    // show the contacts
    spinner = ora("Fetching contact numbers...").start();
    const contactNumbers = await conn.query(
      "SELECT contact_number FROM food_establishment_contact_number WHERE establishment_id=?",
      [establishmentIdPrompt.id]
    );
    spinner.stop();

    // show the tables otherwise
    table = new CliTable3({
      head: [chalk.green("Contact Number")],
    });
    for (let tuple of contactNumbers) {
      table.push([tuple.contact_number]);
    }
    console.log(table.toString());

    if (contactNumbers.length === 0) {
      console.log(chalk.blueBright("No contact numbers yet."));
    }

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
