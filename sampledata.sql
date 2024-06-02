-- Insert users
INSERT INTO user (first_name, last_name, usertype, email, hashed_password) VALUES("admin", "admin", "admin", "admin@admin.com", "$2b$10$UuXc9wmOe061Lj9K5u.y4.x9C8SUJxKv4XlOh6m6m2Q3OyBi5/YsW");
INSERT INTO user (first_name, last_name, usertype, email, hashed_password) VALUES("test", "test", "test", "test@test.com", "$2b$10$qDfbCGpZextrDflUXj3YDujIsd91kz.bHUGWBKTzGrXiqDOJ5n/iC");

-- Insert food establishments
INSERT INTO food_establishment (name, address, email) VALUES("Jollibee", "123 Apple St., Baker City", "jolibee@email.com");
INSERT INTO food_establishment (name, address, email) VALUES("Myrna's Vegan Restaurant", "456 Carrot St., Dressing City", "veganism@email.com");
INSERT INTO food_establishment (name, address, email) VALUES("The Kimchi Factory", "789 Pickle St., Ferment City", "kimchifactory@email.com");

-- Insert food items
INSERT INTO food_item (name, price, availability, establishment_id) VALUES("Chicken Joy", 79.00, TRUE, 1);
INSERT INTO food_item (name, price, availability, establishment_id) VALUES("French Fries", 49.00, TRUE, 1);
INSERT INTO food_item (name, price, availability, establishment_id) VALUES("Mushroom Burger", 99.00, TRUE, 2);
INSERT INTO food_item (name, price, availability, establishment_id) VALUES("Tofu-based Chicken", 139.00, FALSE, 2);
INSERT INTO food_item (name, price, availability, establishment_id) VALUES("Kimchi Jar", 100.00, TRUE, 3);
INSERT INTO food_item (name, price, availability, establishment_id) VALUES("Bibimbap", 150.00, TRUE, 3);

-- Insert Reviews
-- Establishment Reviews
INSERT INTO review (rating, user_id, description, establishment_id) VALUES (4, 2, "yummy", 1);
INSERT INTO review (rating, user_id, description, establishment_id) VALUES (3, 2, "yummy", 1);
INSERT INTO review (rating, user_id, description, establishment_id) VALUES (2, 2, "yummy", 1);
INSERT INTO review (rating, user_id, description, establishment_id) VALUES (4, 2, "yummy", 2);
INSERT INTO review (rating, user_id, description, establishment_id) VALUES (4, 2, "yummy", 3);
-- Dummy Review for testing
INSERT INTO review (review_date, rating, user_id, description, establishment_id) VALUES ('2020-01-01 00:00:00', 4, 3, "yummy", 3);

-- Food Reviews
INSERT INTO review (rating, user_id, description, food_id) VALUES (4, 2, "yummy", 1);
INSERT INTO review (rating, user_id, description, food_id) VALUES (3, 2, "yummy", 1);
INSERT INTO review (rating, user_id, description, food_id) VALUES (2, 2, "yummy", 1);
INSERT INTO review (rating, user_id, description, food_id) VALUES (4, 2, "yummy", 2);
INSERT INTO review (rating, user_id, description, food_id) VALUES (4, 2, "yummy", 3);
-- Dummy Review for testing
INSERT INTO review (review_date, rating, user_id, description, food_id) VALUES ('2020-01-01 00:00:00', 4, 3, "yummy", 3);

-- Insert Item Type
INSERT INTO food_item_type (food_id, type) VALUES (1, "meat");
INSERT INTO food_item_type (food_id, type) VALUES (3, "vegan");
INSERT INTO food_item_type (food_id, type) VALUES (4, "vegan");
INSERT INTO food_item_type (food_id, type) VALUES (5, "veg");
INSERT INTO food_item_type (food_id, type) VALUES (6, "meat");

-- Insert Allergens
INSERT INTO food_item_allergen (food_id, allergen) VALUES (1, "poultry");
INSERT INTO food_item_allergen (food_id, allergen) VALUES (3, "wheat");
INSERT INTO food_item_allergen (food_id, allergen) VALUES (4, "soy");
INSERT INTO food_item_allergen (food_id, allergen) VALUES (4, "wheat");

