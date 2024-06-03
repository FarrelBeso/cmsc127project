import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../auth_cmds.js";

/**
 * Update contact number.
 */
export async function updateContactNum() {
  let conn, spinner, table;
  try {
    // login first
    conn = await connectDB();
    const loginResponse = await login(conn);
    if (!loginResponse.success || loginResponse.user.usertype !== "admin") {
      throw "Only admin users can use this functionality.";
    }

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
      process.exit(0);
    }

    const contactNumberPrompt = await inquirer.prompt([
      {
        name: "contactNumber",
        message: "Enter the contact number:",
        type: "input",
      },
    ]);

    // double check if contact number does not exist
    if (
      !contactNumbers.find(
        (contactNumber) =>
          contactNumber.contact_number === contactNumberPrompt.contactNumber
      )
    ) {
      console.log(chalk.magentaBright("Contact number does not exist."));
      process.exit(0);
    }

    // prompt the new contact number
    const newContactNumberPrompt = await inquirer.prompt([
      {
        name: "contactNumber",
        message: "Enter the new contact number:",
        type: "input",
      },
    ]);

    // insert to db
    spinner = ora("Updating contact number...").start();
    await conn.query(
      "UPDATE food_establishment_contact_number SET contact_number=? WHERE establishment_id=? AND contact_number=?",
      [
        newContactNumberPrompt.contactNumber,
        establishmentIdPrompt.id,
        contactNumberPrompt.contactNumber,
      ]
    );
    spinner.stop();

    // confirm operation
    console.log(chalk.greenBright("Contact edited successfully!"));
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
