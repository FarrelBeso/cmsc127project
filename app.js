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
  .command("get-high-ave-estabs")
  .description("Get all establishments with a high rating (4 and above).")
  .action(reports.getHighAveEstabs);

program
  .command("get-items-by-price")
  .description("Get all food items within a set price range.")
  .action(reports.getItemsByPrice);

program
  .command("get-items-by-price-type")
  .description(
    "Get all food items belonging to the specified type and within a set price range."
  )
  .action(reports.getItemsByPriceType);

program
  .command("get-items-by-type")
  .description("Get all food items belonging to the specified type.")
  .action(reports.getItemsByType);

program
  .command("get-items-from-estab")
  .description("Get food items from an establishment.")
  .action(reports.getItemsFromEstab);

program
  .command("get-items-from-estab-food-type")
  .description("Get food items from an establishment with a given food type/s.")
  .action(reports.getItemsFromEstabFoodType);

program
  .command("get-items-price-order")
  .description(
    "Get the food items from an establishment arranged according to price."
  )
  .action(reports.getItemsPriceOrder);

program
  .command("get-month-review-from-estabs")
  .description("Get all reviews for an establishment within a month.")
  .action(reports.getMonthReviewFromEstabs);

program
  .command("get-month-review-from-items")
  .description("Get all reviews for an item within a month.")
  .action(reports.getMonthReviewFromItems);

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

program
  .command("delete-user")
  .description("Delete a user.")
  .action(additional_features.users.deleteUser);

program
  .command("search-user")
  .description("Search for a user.")
  .action(additional_features.users.searchUser);

program
  .command("update-user")
  .description("Update a user.")
  .action(additional_features.users.updateUser);

// FOOD TYPE
program
  .command("add-food-type")
  .description("Add a food type to food item.")
  .action(additional_features.food_types.addFoodType);

program
  .command("delete-food-type")
  .description("Delete a food type from a food item.")
  .action(additional_features.food_types.deleteFoodType);

program
  .command("search-food-type")
  .description("Search food types of a food item.")
  .action(additional_features.food_types.searchFoodType);

program
  .command("update-food-type")
  .description("Update the food type of a food item.")
  .action(additional_features.food_types.updateFoodType);

// ALLERGENS
program
  .command("add-allergen")
  .description("Add an allergen to food item.")
  .action(additional_features.allergens.addAllergen);

program
  .command("delete-allergen")
  .description("Delete an allergen from food item.")
  .action(additional_features.allergens.deleteAllergen);

program
  .command("search-allergen")
  .description("Search allergens from food item.")
  .action(additional_features.allergens.searchAllergen);

program
  .command("update-allergen")
  .description("Update an allergen in a food item.")
  .action(additional_features.allergens.updateAllergen);

// CONTACT NUMBERS
program
  .command("add-contact-num")
  .description("Add a contact number to food establishment.")
  .action(additional_features.contact_numbers.addContactNum);

program
  .command("delete-contact-num")
  .description("Delete a contact number from food establishment.")
  .action(additional_features.contact_numbers.deleteContactNum);

program
  .command("search-contact-num")
  .description("Search a contact number in a food establishment.")
  .action(additional_features.contact_numbers.searchContactNum);

program
  .command("update-contact-num")
  .description("Update a contact number to food establishment.")
  .action(additional_features.contact_numbers.updateContactNum);

// CONTACT PERSONS
program
  .command("add-contact-person")
  .description("Add a contact person to food establishment.")
  .action(additional_features.contact_persons.addContactPerson);

program
  .command("delete-contact-person")
  .description("Delete a contact person from food establishment.")
  .action(additional_features.contact_persons.deleteContactPerson);

program
  .command("search-contact-person")
  .description("Search a contact person in a food establishment.")
  .action(additional_features.contact_persons.searchContactPerson);

program
  .command("update-contact-person")
  .description("Update a contact person to food establishment.")
  .action(additional_features.contact_persons.updateContactPerson);

// OWNER NAMES
program
  .command("add-owner")
  .description("Add an owner to food establishment.")
  .action(additional_features.owner_names.addOwner);

program
  .command("delete-owner")
  .description("Delete an owner from a food establishment.")
  .action(additional_features.owner_names.deleteOwner);

program
  .command("search-owner")
  .description("Search an owner from a food establishment.")
  .action(additional_features.owner_names.searchOwner);

program
  .command("update-owner")
  .description("Update the owner in a food establishment.")
  .action(additional_features.owner_names.updateOwner);

// MISCELLANEOUS
program
  .command("get-all-items")
  .description("Get all food items.")
  .action(additional_features.misc.getAllItems);

program.parse();
