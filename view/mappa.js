const table = document.getElementById("table");
const tHead = `
  <thead>
      <tr>
        <th>Codice</th>
        <th>Nome</th>
        <th>Coordinate</th>
        <th>Visualizza</th>
      </tr>
  </thead>`;

const template = `
<tbody>
  <tr>
    <td>%CODICE</td>
    <td>%NAME</td>
    <td>%COORDINATE</td>
    <td>%BUTTON</td>
</tbody>`;

const load = () => {
  return new Promise((resolve, reject) => {
    fetch("/strutture")
      .then((response) => response.json())
      .then((json) => {
        resolve(json.result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

let map = L.map("map");
let mapCentered = false;

const centerMap = (points) => {
  if (!mapCentered) {
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 15);
      mapCentered = true;
    } else {
      const bounds = L.latLngBounds(
        points.map((point) => [point.lat, point.lon]),
      );
      map.fitBounds(bounds);
      mapCentered = true;
    }
  }
};

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);

const renderPoints = (points) => {
  let html = tHead;
  let markerCoordinates = [];
  const markers = [];

  for (let i = 0; i < points.length; i++) {
    let marker = L.marker([points[i].lat, points[i].lon]).addTo(map);
    marker
      .bindPopup("<b>" + points[i].nome + "</b><br>" + points[i].descrizione)
      .openPopup();
    markers.push(marker);

    markerCoordinates.push([points[i].lon, points[i].lat]);
    html += template
      .replace("%CODICE", points[i].id)
      .replace("%NAME", points[i].nome)
      .replace("%COORDINATE", points[i].indirizzo)
      .replace(
        "%BUTTON",
        "<button class='btn btn-info' name='visualizza'>Visualizza</button>",
      );
  }
  table.innerHTML = html;
  map.fitBounds(markerCoordinates);
  const buttons = document.querySelectorAll("button[name=visualizza]");
  buttons.forEach((button, index) => {
    button.onclick = () => {
      map.setView([points[index].lat, points[index].lon]);
      markers[index].openPopup();
    };
  });
};

load()
  .then((points) => {
    renderPoints(points);
    console.log(points);
    // Aggiungi un intervallo che controlla la posizione della mappa ogni secondo
    setInterval(centerMap(points), 1000);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
