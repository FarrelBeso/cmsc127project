import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../auth_cmds.js";

/**
 * Update contact person.
 */
export async function updateOwner() {
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
    spinner = ora("Fetching contact persons...").start();
    const contactPersons = await conn.query(
      "SELECT contact_person FROM food_establishment_contact_person WHERE establishment_id=?",
      [establishmentIdPrompt.id]
    );
    spinner.stop();

    // show the tables otherwise
    table = new CliTable3({
      head: [chalk.green("Contact Person")],
    });
    for (let tuple of contactPersons) {
      table.push([tuple.contact_person]);
    }
    console.log(table.toString());

    if (contactPersons.length === 0) {
      console.log(chalk.blueBright("No contact persons yet."));
      process.exit(0);
    }

    const contactPersonPrompt = await inquirer.prompt([
      {
        name: "contactPerson",
        message: "Enter the contact person:",
        type: "input",
      },
    ]);

    // double check if contact person does not exist
    if (
      !contactPersons.find(
        (contactPerson) =>
          contactPerson.contact_person === contactPersonPrompt.contactPerson
      )
    ) {
      console.log(chalk.magentaBright("Contact person does not exist."));
      process.exit(0);
    }

    // prompt the new contact person
    const newContactPersonPrompt = await inquirer.prompt([
      {
        name: "contactPerson",
        message: "Enter the new contact person:",
        type: "input",
      },
    ]);

    // insert to db
    spinner = ora("Updating contact person...").start();
    await conn.query(
      "UPDATE food_establishment_contact_person SET contact_person=? WHERE establishment_id=? AND contact_person=?",
      [
        newContactPersonPrompt.contactPerson,
        establishmentIdPrompt.id,
        contactPersonPrompt.contactPerson,
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
