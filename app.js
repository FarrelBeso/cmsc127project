#!/usr/bin/env node
import { Command } from "commander";
import { register } from "./commands/auth_cmds.js";
import { addReviewToEstab } from "./commands/features/feature_1/addReviewToEstab.js";
import { getAllEstabs } from "./commands/reports/getAllEstabs.js";
import { getReviewsFromEstabs } from "./commands/reports/getReviewsFromEstabs.js";
import { getReviewsFromItems } from "./commands/reports/getReviewsFromItems.js";
import { getItemsFromEstab } from "./commands/reports/getItemsFromEstab.js";
import { getItemsFromEstabFoodType } from "./commands/reports/getItemsFromEstabFoodType.js";

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
  .action(addReviewToEstab);

// FEATURE 2

// FEATURE 3

// REPORTS
program
  .command("get-all-estabs")
  .description("Get all establishments.")
  .action(getAllEstabs);

program
  .command("get-items-from-estab")
  .description("Get food items from an establishment.")
  .action(getItemsFromEstab);

program
  .command("get-items-from-estab-food-type")
  .description("Get food items from an establishment with a given food type/s.")
  .action(getItemsFromEstabFoodType);

program
  .command("get-reviews-from-estabs")
  .description("Get all reviews from an establishment.")
  .action(getReviewsFromEstabs);

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
