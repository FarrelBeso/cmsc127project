#!/usr/bin/env node
import { Command } from "commander";

import features from "./commands/features/index.js";
import reports from "./commands/reports/index.js";
import { register } from "./commands/additional_features/auth_cmds.js";

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
  .action(features.addReviewToEstab);

// FEATURE 2

// FEATURE 3

// REPORTS
program
  .command("get-all-estabs")
  .description("Get all establishments.")
  .action(reports.getAllEstabs);

program
  .command("get-items-from-estab")
  .description("Get food items from an establishment.")
  .action(reports.getItemsFromEstab);

program
  .command("get-items-from-estab-food-type")
  .description("Get food items from an establishment with a given food type/s.")
  .action(reports.getItemsFromEstabFoodType);

program
  .command("get-reviews-from-estabs")
  .description("Get all reviews from an establishment.")
  .action(reports.getReviewsFromEstabs);

program
  .command("get-reviews-from-items")
  .description("Get all reviews from food items.")
  .action(reports.getReviewsFromItems);

// ADDITIONAL FEATURES

// USERS

program
  .command("register")
  .description("Register a new user.")
  .action(register);

// FOOD TYPE

program.parse();
