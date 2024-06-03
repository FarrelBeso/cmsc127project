import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import CliTable3 from "cli-table3";
import { connectDB, disconnectDB } from "../../../db/connectDB.js";
import { login } from "../auth_cmds.js";

/**
 * Add owner.
 */
export async function addOwner() {
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
    spinner = ora("Fetching owners...").start();
    const owners = await conn.query(
      "SELECT owner_name FROM food_establishment_owner_name WHERE establishment_id=?",
      [establishmentIdPrompt.id]
    );
    spinner.stop();

    // show the tables otherwise
    table = new CliTable3({
      head: [chalk.green("Owner")],
    });
    for (let tuple of owners) {
      table.push([tuple.owner_name]);
    }
    console.log(table.toString());

    if (owners.length === 0) {
      console.log(chalk.blueBright("No owners yet."));
    }

    const ownerPrompt = await inquirer.prompt([
      {
        name: "owner",
        message: "Enter the owner:",
        type: "input",
      },
    ]);

    // double check if owner already exists
    if (owners.find((owner) => owner.owner_name === ownerPrompt.owner)) {
      console.log(chalk.magentaBright("Owner already exists."));
      process.exit(0);
    }

    // insert to db
    spinner = ora("Adding owner...").start();
    await conn.query(
      "INSERT INTO food_establishment_owner_name (establishment_id, owner_name) VALUES (?, ?)",
      [establishmentIdPrompt.id, ownerPrompt.owner]
    );
    spinner.stop();

    // confirm operation
    console.log(chalk.greenBright("Owner added successfully!"));
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
