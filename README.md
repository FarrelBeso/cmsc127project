# CMSC 127 Project

## Instructions

## Before Running

0. Ensure that the MySQL server is active (I'm not sure how to run it in Windows or Linux since I use Mac; this might be helpful: https://www.tutorialspoint.com/starting-and-stopping-mysql-server)
1. Login to MariaDB as root user. Ensure that you're in the root folder of the project.
2. Import the files from `initialize.sql` and `sampledata.sql`.
   <br>
   `source initialize.sql`
   <br>
   `source sampledata.sql`
3. Create a user for the application.
   <br>
   `CREATE USER foodreviewer@localhost IDENTIFIED BY 'foodreview123'`
4. Grant access to that new user.
   <br>
   `GRANT ALL PRIVILEGES ON food_reviewer TO foodreviewer@localhost`
5. Quit as a root user.
   <br>
   `quit`
6. Double check by logging in as that new user. If you see the database, then you're ready to proceed with starting the app.
   <br>
   `mysql -u foodreviewer@localhost -pfoodreview123`
   <br>
   `show databases`

## Running the App

1. If you haven't imported the required modules and assuming that npm is already in your device (otherwise do check from the web how to install it), import the modules.
   <br>
   `npm i -g`
2. Run the app. Try to type the following for the commands available, and to see if the app now works.
   <br>
   `food-reviewer -h`

## Other Info

Further information on the libraries used could be seen in npm documentation (npmjs.com). Do check the documentation for more information. Thank you!
<br>
Here are the bases for the project:

1. https://www.freecodecamp.org/news/nodejs-tutorial-build-a-task-manager-cli-tool/
2. https://mariadb.com/kb/en/getting-started-with-the-nodejs-connector/
