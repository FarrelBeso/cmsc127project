DROP DATABASE IF EXISTS food_reviewer;

CREATE DATABASE food_reviewer;

use food_reviewer;

CREATE TABLE user (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    usertype ENUM('admin', 'user') NOT NULL,
    email VARCHAR(100) NOT NULL,
    hashed_password CHAR(60) NOT NULL,
    CONSTRAINT users_email_uk UNIQUE(email)
);

CREATE TABLE food_establishment (
    establishment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(200),
    email VARCHAR(100)
);

CREATE TABLE food_item (
    food_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability BOOLEAN NOT NULL,
    establishment_id INT NOT NULL,
    CONSTRAINT food_item_establishment_id_fk FOREIGN KEY(establishment_id) REFERENCES food_establishment(establishment_id)
);


CREATE TABLE review (
	review_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	rating INT NOT NULL,
	description TEXT(1000),
	establishment_id INT,
	food_id INT,
	user_id INT NOT NULL,
	CONSTRAINT review_establishment_id_fk FOREIGN KEY(establishment_id) REFERENCES food_establishment(establishment_id),
	CONSTRAINT review_food_id_fk FOREIGN KEY(food_id) REFERENCES food_item(food_id),
	CONSTRAINT review_user_id_fk FOREIGN KEY(user_id) REFERENCES user(user_id)
);

CREATE TABLE food_item_type (
	food_id INT NOT NULL,
	type VARCHAR(50) NOT NULL,
	CONSTRAINT PRIMARY KEY (food_id, type)
);

CREATE TABLE food_item_allergen (
	food_id INT NOT NULL,
	allergen VARCHAR(50) NOT NULL,
	CONSTRAINT PRIMARY KEY (food_id, allergen)
);

CREATE TABLE food_establishment_owner_name (
	establishment_id INT NOT NULL,
	owner_name VARCHAR(50) NOT NULL,
	CONSTRAINT PRIMARY KEY (establishment_id, owner_name)
);

CREATE TABLE food_establishment_contact_number (
	establishment_id INT NOT NULL,
	contact_number VARCHAR(20) NOT NULL,
	CONSTRAINT PRIMARY KEY (establishment_id, contact_number)
);

CREATE TABLE food_establishment_contact_person (
	establishment_id INT NOT NULL,
	contact_person VARCHAR(100) NOT NULL,
	CONSTRAINT PRIMARY KEY (establishment_id, contact_person)
);
