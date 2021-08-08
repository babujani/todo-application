const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let db = null;

const startServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at port 3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
startServerAndDb();

//get todo for given query parameters

const queryParameterWithStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const queryParameterWithStatusAndPriority = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const queryParameterWithPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodo = "";
  let queryTable = null;

  switch (true) {
    case queryParameterWithStatus(request.query):
      getTodo = `
     SELECT *FROM  todo
     WHERE status='${status}'
     AND todo LIKE '%${search_q}%'
     ;`;
      break;
    case queryParameterWithStatusAndPriority(request.query):
      getTodo = `
     SELECT *FROM  todo
     WHERE status='${status}'
     AND priority='${priority}
     AND todo LIKE '%${search_q}%'
     ;`;
      break;
    case queryParameterWithPriority(request.query):
      getTodo = `
     SELECT *FROM  todo
     WHERE priority='${priority}'
     AND todo LIKE '%${search_q}%'
     ;`;
      break;

    default:
      getTodo = `
     SELECT *FROM  todo
     WHERE  todo LIKE '%${search_q}%'
     ;`;
  }

  queryTable = await db.all(getTodo);
  response.send(queryTable);
});

//get todo with id
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
    SELECT * FROM todo
    WHERE id=${todoId}
    ;`;
  const aTodo = await db.get(getTodo);
  response.send(aTodo);
});

//post todo details
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoDetails = `
    INSERT INTO
    todo (id,todo,priority,status)
    VALUES(${id},'${todo}','${priority}','${status}')
        ;`;
  await db.run(postTodoDetails);
  response.send("Todo Successfully Added");
});

// put todo details
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const presentTodo = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(presentTodo);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodo = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodo);
  response.send(`${updateColumn} Updated`);
});

// delete todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodo);
  response.send("Todo Deleted");
});
module.exports = app;
