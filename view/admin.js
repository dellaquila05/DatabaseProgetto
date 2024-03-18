const indietro = document.getElementById("indietro");
const inserisci = document.getElementById("inserisci");
const tabella = document.getElementById("tabella");
const nome = document.getElementById("nome");
const indirizzo = document.getElementById("indirizzo");
const pass = document.getElementById("password");
const user = document.getElementById("user");
const buttonLogin = document.getElementById("buttonLogin");
const divLogin = document.getElementById("public");
const divAdmin = document.getElementById("private");
const divLoginButton = document.getElementById("login");
const loading = document.getElementById("loading");
const descrizione = document.getElementById("descrizione");
const alert = document.getElementById("alert");
const tableHeader =
  "<tr> <th> Name </th> <th>Address </th> <th>Description</th> </tr>";

const load = () => {
  return new Promise((resolve, reject) => {
    fetch("/strutture")
      .then((response) => response.json())
      .then((json) => {
        resolve(json.result);
      });
  });
};

const sendStrutture = (strutture) => {
  return new Promise((resolve, reject) => {
    fetch("/structure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        strutture: strutture,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      });
  });
};

const sendDati = (user, pass) => {
  return new Promise((resolve, reject) => {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user,
        password: pass,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      });
  });
};

buttonLogin.onclick = () => {
  divLoginButton.classList.add("d-none"); //evito che l'utente prema il pulsante due volte di fila facendolo scomparire
  loading.classList.remove("d-none"); //faccio comparire un pulsante disabilitato che possiede uno spinner di bootstrap
  if (user.value !== "" && pass.value !== "") {
    sendDati(user.value, pass.value).then((json) => {
      if (json.result === true) {
        divLogin.classList.add("d-none");
        divAdmin.classList.remove("d-none");
      } else if (json.result === false) {
        alert.classList.remove("d-none");
        loading.classList.add("d-none");
        divLoginButton.classList.remove("d-none");
      }
    });
  } else {
    alert.classList.remove("d-none");
    loading.classList.add("d-none");
    divLoginButton.classList.remove("d-none");
  }
};
const table = `
  <tr>
    <td >%NAME</td>
    <td >%ADDRESS</td>
    <td >%DESCRIPTION</td>
  </tr>
    `;
const urlGeocode =
  "https://api.geoapify.com/v1/geocode/search?apiKey=5e8d464f7a6f48f281288c93c1531355&text=%PLACE";

let htmlTab = tableHeader;
let strutture = [];
const callRemote = (url, callback) => {
  fetch(url).then((response) => {
    response.json().then(callback);
  });
};
//Togliere il commento alla riga sotto per azzerare le strutture memorizzate in cache

indietro.onclick = () => {
  window.location.href = "index.html";
};
const render = () => {
  load().then((points) => {
    strutture = points;
    if (strutture) {
      htmlTab = tableHeader;
      strutture.forEach((element) => {
        let temp_table = table;
        htmlTab += temp_table
          .replace("%NAME", element.nome)
          .replace("%ADDRESS", element.indirizzo)
          .replace("%DESCRIPTION", element.descrizione);
      });
      tabella.innerHTML = htmlTab;
    }
  });
};

inserisci.onclick = () => {
  if (nome.value !== "" && indirizzo.value !== "" && descrizione.value !== "") {
    console.log("ciao");
    // cerco le coordinate dell'indirizzo DA USARE PER CREAZIONE MARKER
    let url = urlGeocode.replace("%PLACE", indirizzo.value);
    let lon = 0;
    let lat = 0;
    callRemote(url, (result) => {
      let features = result.features;
      let res = features[0];
      if (res !== undefined) {
        lon = res.properties.lon;
        lat = res.properties.lat;

        // ora che ho le coordinate salvo l'indirizzo
        strutture.push({
          nome: nome.value,
          indirizzo: indirizzo.value,
          descrizione: descrizione.value,
          lon: lon,
          lat: lat,
        });

        sendStrutture({
          nome: nome.value,
          indirizzo: indirizzo.value,
          descrizione: descrizione.value,
          lon: lon,
          lat: lat,
        }).then((json) => {
          render();
          console.log(json);
        });
      } else {
        alert(
          "L'indirizzo inserito non è valido, controlla di aver scritto un indirizzo esistente",
        );
      }
    });
  }
};
render();
