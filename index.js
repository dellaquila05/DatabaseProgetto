const fs = require("fs");
const express = require("express");
const mysql = require("mysql");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const conf = require("./dataAccess/conf.js");
const connection = mysql.createConnection(conf);
const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use("/", express.static(path.join(__dirname, "view")));

const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) {
        console.error(err);
        reject();
      }
      console.log("done");
      resolve(result);
    });
  });
};

const server = http.createServer(app);
server.listen(80, () => {
  console.log("- server running");
});
