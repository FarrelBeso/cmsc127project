#!/usr/bin/env node
import getEstablishments from "./commands/establishment_cmds.js";
import getReviewsFromEstablishments from "./commands/review_cmds.js";
import { Command } from "commander";
import register from "./commands/user_cmds.js";

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

program
  .command("register")
  .description("Register a new user.")
  .action(register);

program.parse();
