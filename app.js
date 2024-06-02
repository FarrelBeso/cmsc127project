#!/usr/bin/env node
import { Command } from "commander";

import features from "./commands/features/index.js";
import reports from "./commands/reports/index.js";
import additional_features from "./commands/additional_features/index.js";
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
  .action(features.feature_1.addReviewToEstab);
//ADDED BY ALEM  vv
program
  .command("add-review-to-item")
  .description("Add a review to a food item.")
  .action(features.feature_1.addReviewToItem);

program
  .command("update-estab-review")
  .description("Update a food establishment review.")
  .action(features.feature_1.updateEstabReview);

program
  .command("update-item-review")
  .description("Update a food item review.")
  .action(features.feature_1.updateItemReview);

program
  .command("delete-estab-review")
  .description("Delete a food establishment review.")
  .action(features.feature_1.deleteEstabReview);

program
  .command("delete-item-review")
  .description("Delete a food item review.")
  .action(features.feature_1.deleteItemReview);
//ADDED BY ALEM^^

// FEATURE 2
program
  //ALEM vv
  .command("add-estab")
  .description("Add a food establishment.")
  .action(features.feature_2.addEstab);

program
  .command("delete-estab")
  .description("Delete a food establishment.")
  .action(features.feature_2.deleteEstab);

program
  .command("search-estab")
  .description("Search a food establishment.")
  .action(features.feature_2.searchEstab);

program
  .command("update-estab")
  .description("Update a food establishment.")
  .action(features.feature_2.updateEstab);
//ALEM^^
// FEATURE 3
program
  //ALEM vv
  .command("add-item")
  .description("Add a food item.")
  .action(features.feature_3.addItem);

program
  .command("delete-item")
  .description("Delete a food item.")
  .action(features.feature_3.deleteItem);

program
  .command("search-item")
  .description("Search a food item.")
  .action(features.feature_3.searchItem);

program
  .command("update-item")
  .description("Update a food item.")
  .action(features.feature_3.updateItem);

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

program
  .command("get-month-review-from-estabs")
  .description("Get all reviews made within the month for an establishment.")
  .action(reports.getMonthReviewFromEstabs);

program
  .command("get-month-review-from-items")
  .description("Get all reviews made within the month for a food item.")
  .action(reports.getMonthReviewFromItems);

program
  .command("get-high-ave-estabs")
  .description(
    "Get all food items from an establishment with a high average rating."
  )
  .action(reports.getHighAveEstabs);

program
  .command("get-items-price-order")
  .description("Get all food items from an establishment arranged by price.")
  .action(reports.getItemsPriceOrder);

program
  .command("get-items-by-type")
  .description("Get all food items based on price range and/or food type.")
  .action(reports.getItemsByType);

// ADDITIONAL FEATURES
// USERS
program
  .command("register")
  .description("Register a new user.")
  .action(register);

// FOOD TYPE

// MISCELLANEOUS
program
  .command("get-all-items")
  .description("Get all food items.")
  .action(additional_features.misc.getAllItems);

program.parse();
