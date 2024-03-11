const indietro = document.getElementById("indietro");
const inserisci = document.getElementById("inserisci");
const tabella = document.getElementById("tabella");
const nome = document.getElementById("nome");
const indirizzo = document.getElementById("indirizzo");
const descrizione = document.getElementById("descrizione");
const tableHeader =
  "<tr> <th> Name </th> <th>Address </th> <th>Description</th> </tr>";


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
//saveCache(strutture, "strutture")

indietro.onclick = () => {
  window.location.href = "index.html";
};
inserisci.onclick = () => {
  if (nome.value !== "" && indirizzo.value !== "" && descrizione.value !== "") {
    // cerco le coordinate dell'indirizzo
    let url = urlGeocode.replace("%PLACE", indirizzo.value);
    let point = {};
    callRemote(url, (result) => {
      let features = result.features;
      let res = features[0];
      point = {
        lonlat: [res.properties.lon, res.properties.lat],
      };
      // ora che ho le coordinate salvo l'indirizzo
      strutture.push({
        nome: nome.value,
        indirizzo: indirizzo.value,
        descrizione: descrizione.value,
        lonlat: point,
      });
    });
  }
};

const render = () => {
  if (strutture) {
    console.log("strutture", strutture);
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
};
render();
