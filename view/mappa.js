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
      });
  });
};

let map = L.map("map");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

load().then((points) => {
  console.log(points);
  let html = tHead;
  let markerCoordinates = [];

  for (let i = 0; i < points.length; i++) {
    let marker = L.marker([points[i].lon, points[i].lat]).addTo(map);
    marker
      .bindPopup("<b>" + points[i].nome + "</b><br>" + points[i].descrizione)
      .openPopup();

    markerCoordinates.push([points[i].lon, points[i].lat]);
    const coordinate = points[i].lon + ", " + points[i].lat;
    html += template
      .replace("%CODICE", points[i].id)
      .replace("%NAME", points[i].nome)
      .replace("%COORDINATE", coordinate)
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
      map.setView([points[index].lon, points[index].lat]);
    };
  });
});
