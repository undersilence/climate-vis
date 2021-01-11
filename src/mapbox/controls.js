import * as dat from 'dat.gui';
import { heatLayer, windLayer } from './wind-main';

const gui = new dat.GUI({ autoPlace: false });

export const windcontrol = {
  Wind: false,
  Heat: false,
  '2020-12-23+h': 0,
  retina: false,
  numParticles: 65536,
  fadeOpacity: 0.95,
  speedFactor: 0.25,
  dropRate: 0.003,
  dropRateBump: 0.01,
};

function showWindLayer(map) {
  if (windcontrol.Wind) { map.addLayer(windLayer); } else { map.removeLayer(windLayer.id); }
}

function showHeatLayer(map) {
  if (windcontrol.Heat) { map.addLayer(heatLayer); } else { map.removeLayer(heatLayer.id); }
}

function updateWind(name) {
  if (windLayer.wind) { windLayer.wind.updateWind(name); } else { console.log('windLayer.wind is NULL'); }
}

function updateParameters(param) {
  if (windLayer.wind) {
    windLayer.wind.numParticles = windcontrol.numParticles;
    windLayer.wind.fadeOpacity = windcontrol.fadeOpacity;
    windLayer.wind.speedFactor = windcontrol.speedFactor;
    windLayer.wind.dropRate = windcontrol.dropRate;
    windLayer.wind.dropRateBump = windcontrol.dropRateBump;
  } else { console.log('windLayer.wind is NULL'); }
}

function updateRetina() {
  if (windLayer.wind) { windLayer.wind.updateRetina(windcontrol.retina); } else { console.log('windLayer.wind is NULL'); }
}

export function loadControls(map) {
  document.getElementById('controls').appendChild(gui.domElement);

  // Wind Controls
  gui.add(windcontrol, 'Wind').onFinishChange(() => showWindLayer(map));
  gui.add(windcontrol, 'Heat').onFinishChange(() => showHeatLayer(map));
  gui.add(windcontrol, '2020-12-23+h', 0, 162, 6).onFinishChange(updateWind);
  gui.add(windcontrol, 'numParticles', 1024, 589824).onFinishChange(updateParameters);
  gui.add(windcontrol, 'fadeOpacity', 0.96, 0.999).step(0.001).onFinishChange(updateParameters);
  gui.add(windcontrol, 'speedFactor', 0.05, 1.0).onFinishChange(updateParameters);
  gui.add(windcontrol, 'dropRate', 0, 0.1).onFinishChange(updateParameters);
  gui.add(windcontrol, 'dropRateBump', 0, 0.2).onFinishChange(updateParameters);
  // gui.add(windcontrol, 'retina').onFinishChange(updateRetina);  // not work

  // if (windcontrol.Wind) { showWindLayer(map); }
  // if (windcontrol.Heat) { showWindLayer(map); }
  // Heat Controls
}
