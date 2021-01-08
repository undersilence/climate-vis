import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '/src/const';
import { windLayer } from './wind-main';
import { loadControls } from './controls';

loadControls();

mapboxgl.accessToken = MAPBOX_TOKEN;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [121.48, 31.22],
  zoom: 5,
  pitch: 45,
  bearing: -17.6,
  renderWorldCopies: false,
  antialias: true,
});

// function rotateCamera(timestamp) {
//   // clamp the rotation between 0 -360 degrees
//   // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
//   map.rotateTo((timestamp / wind2020.rotateStep) % 360, { duration: 0 });
//   // Request the next frame of the animation.
//   requestAnimationFrame(rotateCamera);
// }

map.on('load', () => {
  // Start the animation.
  // Add 3d buildings and remove label layers to enhance the map
  const { layers } = map.getStyle();
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
      // remove text labels
      map.removeLayer(layers[i].id);
    }
  }

  map.addLayer(
    windLayer,
  );
});
