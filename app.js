#!/usr/bin/env node
import { getEstablishments } from "./commands/establishment_cmds.js";
import {
  addReviewToEstablishment,
  getReviewsFromEstablishments,
  getReviewsFromItems,
} from "./commands/review_cmds.js";
import { Command } from "commander";
import { register } from "./commands/auth_cmds.js";

// TODO: All inputs should be checked if valid first (input validation)
const program = new Command();

program
  .name("food-reviewer")
  .description("Food reviewer CLI for MariaDB.")
  .version("1.0.0");

// FEATURE 1
program
  .command("add-review-to-estab")
  .description("Add a review to an establishment.")
  .action(addReviewToEstablishment);

// FEATURE 2

// FEATURE 3

// REPORTS
program
  .command("get-estabs")
  .description("Get all establishments.")
  .action(getEstablishments);

program
  .command("get-reviews-from-estabs")
  .description("Get all reviews from an establishment.")
  .action(getReviewsFromEstablishments);

program
  .command("get-reviews-from-items")
  .description("Get all reviews from food items.")
  .action(getReviewsFromItems);

// ADDITIONAL FEATURES

// USERS

program
  .command("register")
  .description("Register a new user.")
  .action(register);

// FOOD TYPE

program.parse();
