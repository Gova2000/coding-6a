const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
app.use(express.json());
const path = require("path");
app.listen(3000, () => {
  console.log("This Server running at http://localhost:3000");
});
let db = null;
const pathFix = path.join(__dirname, "covid19India.db");
const conArray = async () => {
  try {
    db = await open({
      filename: pathFix,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("This Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message}`);
  }
};

conArray();

module.exports = app;
