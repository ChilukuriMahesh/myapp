const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
// user signup
app.post("/users/", async (request, response) => {
  const hashPassword = bcrypt.hash(password, 10);
  const { name, username, password, gender, location } = request.body;
  // SelectUserQuery

  const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    //CREATE NEW USER
    const createUserQuery = `
  INSERT INTO
    user (username, name, password, gender, location)
  VALUES
    (
      '${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}'  
    );`;
    await db.run(createUserQuery);
    response.send("user added succesfully");
  } else {
    // UDER ALREADY EXISTS
    response.status(400);
    response.send("user already exists");
  }
});

//USER LOGIN
app.post("/login/", (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`;
  const dbUser = db.get(selectUserQuery);
  if (dbUser === undefined) {
    //user not exist
    resopnse.status(400);
    response.send("Invalid user");
  } else {
    //user exist
    const isMatchedPassword = bcrypt.compare(password, dbUser.password);
    if (isMatchedPassword === true) {
      response.send("login succesfully");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
