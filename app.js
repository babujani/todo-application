const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let db = null;

const startServerAndDb = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("server running at port 3000");
  });
};
startServerAndDb();

//create table
app.post("/todos/", async (request, response) => {
  const createTable = `
     CREATE TABLE todo
     (
         id VALUE INT,
         todo VALUE CHAR,
         priority VALUE CHAR,
         status VALUE CHAR
     );`;
  const table = await db.run(createTable);
  response.send(table);
});
