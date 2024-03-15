const fs = require("fs");
const express = require("express");
const mysql = require("mysql2");
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

const selectAdmin = () => {
  const sql = `
SELECT nome, pass FROM utente
`;
  return executeQuery(sql);
};

const selectStructure = () => {
  const sql = `
SELECT * FROM struttura
`;
  return executeQuery(sql);
};

const insertStructure = (strutture) => {
  console.log(strutture);
  console.log(strutture[0].nome);

  const template = `
INSERT INTO struttura (nome,indirizzo,descrizione,lon,lat) VALUES ("%NOME","%INDIRIZZO","%DESCRIZIONE","%LON" ,"%LAT")
`;
  let sql = "";
  sql = template
    .replace("%NOME", strutture.nome)
    .replace("%INDIRIZZO", strutture.indirizzo)
    .replace("%DESCRIZIONE", strutture.descrizione)
    .replace("%LON", strutture.lon)
    .replace("%LAT", strutture.lat);

  console.log(sql);
  return executeQuery(sql);
};

app.get("/strutture", (req, res) => {
  selectStructure().then((json) => {
    res.json({ result: json });
  });
});

app.post("/login", (req, res) => {
  const data = req.body;
  console.log(data);
  selectAdmin().then((json) => {
    if (json[0].nome === data.username && json[0].pass === data.password) {
      res.json({ result: true });
    } else {
      res.json({ result: false });
    }
  });
});

app.post("/structure", (req, res) => {
  const data = req.body;
  insertStructure(data).then((json) => {
    console.log("Dentro .then" + JSON.stringify(strutture));
    res.json({ result: "ok" });
  });
});

const server = http.createServer(app);
server.listen(80, () => {
  console.log("- server running");
});
