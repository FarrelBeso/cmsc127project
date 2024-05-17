import getEstablishments from "./commands/establishment_cmds.js";
import getReviewsFromEstablishments from "./commands/review_cmds.js";

import { Command } from "commander";

const program = new Command();

program
  .name("food-reviewer")
  .description("Food reviewer CLI for MariaDB.")
  .version("1.0.0");

program
  .command("get-estabs")
  .description("Get all establishments.")
  .action(getEstablishments);

program
  .command("get-reviews-from-estabs")
  .description("Get all reviews from an establishment.")
  .action(getReviewsFromEstablishments);

program.parse();
