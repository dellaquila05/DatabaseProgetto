const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const classifica = [];
const mysql = require("mysql");
const conf = JSON.parse(fs.readFileSync("dataAccess/conf.js"));
const connection = mysql.createConnection(conf);

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



app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
const selectDomande = () => {
  const sql = `
SELECT id, testo FROM domanda
`;
  return executeQuery(sql);
};
const selectRisposte = () => {
  const sql = `
SELECT testo, valore, idDomanda FROM risposta
`;
  return executeQuery(sql);
};
const selectUtente = () => {
  const sql = `
SELECT name, punteggio, data FROM utente
`;
  return executeQuery(sql);
};
const insert = (classifica) => {
  const template = `
INSERT INTO utente (name, punteggio, data) VALUES ("$NAME", "$PUNTEGGIO", "$DATA")
`;
  console.log(
    "stampa classifica dentro insert:" + JSON.stringify(classifica.length),
  );

  let sql = "";
  for (let i = 0; i < classifica.length; i++) {
    sql = template
      .replace("$NAME", classifica[i].username)
      .replace("$PUNTEGGIO", classifica[i].rating)
      .replace("$DATA", classifica[i].timestamp);
  }
  console.log(sql);
  return executeQuery(sql);
};
app.use("/", express.static(path.join(__dirname, "public")));

app.get("/questions", (req, res) => {
  selectDomande().then((result1) => {
    selectRisposte().then((result2) => {
      res.json({ questions: result1, answer: result2 });
    });
  });
});

app.post("/answers", (req, res) => {
  try {
    selectRisposte().then((result) => {
      let somma = 0;
      let punti = 0;
      let timestamp = new Date().toLocaleTimeString();
      const risposte = req.body.answers;
      const risultato = result;
      for (let i = 0; i < risposte.length; i++) {
        for (let id = 0; id < risultato.length; id++) {
          if (risposte[i] !== null) {
            const points = risultato[id].testo;
            if (points === risposte[i]) {
              punti = risultato[id].valore;
              somma += punti;
              console.log("somma corrente: " + somma);
            }
          }
        }
      }
      console.log("fuori:" + somma);
      console.log("username: " + req.body.username);
      classifica.push({
        username: req.body.username,
        rating: somma,
        timestamp: timestamp,
      });
      console.log("classifica: " + JSON.stringify(classifica));

      insert(classifica).then(() => {
        console.log("Dentro .then" + JSON.stringify(classifica));
        res.json({ result: "ok" });
      });
    });
  } catch (e) {
    console.log(e);
    res.status(500);
    res.json({ result: "errore server" });
  }
});

app.get("/ratings", (req, res) => {
  selectUtente().then((result) => {
    res.json({ classifica: result });
  });
});

const server = http.createServer(app);
server.listen(80, () => {
  console.log("- server running");
});
