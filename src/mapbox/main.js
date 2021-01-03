import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '/src/const';
import { onLoad, onUpdate } from './wind-main';

mapboxgl.accessToken = MAPBOX_TOKEN;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [121.48, 31.22],
  zoom: 5,
  pitch: 45,
  bearing: -17.6,
});

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
    {
      id: 'wind-layer',
      type: 'custom',
      // method called when the layer is added to the map
      // https://docs.mapbox.com/mapbox-gl-js/api/#styleimageinterface#onadd
      onAdd: onLoad,
      // method fired on each animation frame
      // https://docs.mapbox.com/mapbox-gl-js/api/#map.event:render
      render: onUpdate,
    },
  );
});
