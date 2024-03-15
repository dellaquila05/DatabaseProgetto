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

  let markerCoordinates = [];

  for (let i = 0; i < points.length; i++) {
    let marker = L.marker([points[i].lon, points[i].lat]).addTo(map);
    marker
      .bindPopup("<b>" + points[i].nome + "</b><br>" + points[i].descrizione)
      .openPopup();

    markerCoordinates.push([points[i].lon, points[i].lat]);
  }

  map.fitBounds(markerCoordinates);
});
