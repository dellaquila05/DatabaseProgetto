import { calcolaDistanza } from "./calcola.js";

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');
const urlGeocode =
  "https://api.geoapify.com/v1/geocode/search?apiKey=5e8d464f7a6f48f281288c93c1531355&text=%PLACE";
let data = [];
let overlay;

function setLayers(map) {
  const layers = [new ol.layer.Tile({ source: new ol.source.OSM() })]; // crea un layer da Open Street Maps
  map.addLayer(new window.ol.layer.Group({ layers })); // lo aggiunge alla mappa
}
function setCenter(map, lonlat) {
  const center = window.ol.proj.fromLonLat(lonlat);
  map.getView().setCenter(center); //fissa il centro della mappa su una certa coppia di coordinate
}
function setZoom(map, maxDist = 1) {
  let zoom = 1;
  if (maxDist < 150) zoom = 1;
  if (maxDist < 100) zoom = 2;
  if (maxDist < 60) zoom = 3;
  if (maxDist < 30) zoom = 4;
  if (maxDist < 10) zoom = 5;
  if (maxDist < 5) zoom = 6;
  if (maxDist < 3) zoom = 7;
  if (maxDist < 2) zoom = 8;
  map.getView().setZoom(zoom); // fissa il livello di zoom
}
function addMarker(map, point, descrizione) {
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat(point.lonlat))
  });
  feature.name = descrizione;
  const layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [feature]
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        crossOrigin: descrizione,
        src: 'https://docs.maptiler.com/openlayers/default-marker/marker-icon.png',
      })
    })
  });
  map.addLayer(layer);
  console.log("aggiunto", map, layer);
}

// crea un popup e gestisce l'apertura dell'overlay
function initOverlay(map, points) {
  overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  map.addOverlay(overlay);
  closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };

  map.on('singleclick', function(event) {
    if (map.hasFeatureAtPixel(event.pixel) === true) { // se esiste un marker
      map.forEachFeatureAtPixel(event.pixel, (feature, layer) => { // lo recupera
        const coordinate = event.coordinate; // ne prende le coordinate
        content.innerHTML = feature.name; // cambia il testo del popup
        overlay.setPosition(coordinate); // e lo sposta sopra il marker
      })
    } else {
      overlay.setPosition(undefined); // altrimenti lo nasconde
      closer.blur();
    }

  });

}

// create map
const map = new ol.Map({ target: document.querySelector('.map') });
setLayers(map);
setCenter(map, [9.0915, 45.2765]);

// Leggo i dati dalla cache remota 
loadCache("strutture").then(addresses => {
  if (addresses) {
    data = addresses;
    let distanzaMax = 0;
    data.forEach((marker) => {
      addMarker(map, marker.lonlat, marker.descrizione);
      let distanza = calcolaDistanza(marker.lonlat.lonlat, [12.4963655, 41.9027835]);
      console.log("distanza", distanza);
      if (distanzaMax < distanza) {
        distanzaMax = distanza;
      }
    })
    console.log("distanzaMax prima = ", distanzaMax);
    if (distanzaMax < 1) {
      distanzaMax = 1;
    setZoom(map, distanzaMax);
    console.log("distanzaMax= ", distanzaMax);
  }

});

initOverlay(map);





