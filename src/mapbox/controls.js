import * as dat from 'dat.gui';
import { getJSON } from '/src/util';
import { windLayer } from './wind-main';

const gui = new dat.GUI({ autoPlace: false });

export const wind2020 = {
  '2020-12-23+h': 0,
  rotateStep: 100,
};

const windFiles = {
  0: '2020122300',
  6: '2020122306',
  12: '2020122312',
  18: '2020122318',
  24: '2020122400',
  30: '2020122406',
  36: '2020122412',
  42: '2020122418',
  48: '2020122500',
  54: '2020122506',
  60: '2020122512',
  66: '2020122518',
  72: '2020122600',
  78: '2020122606',
  84: '2020122612',
  90: '2020122618',
  96: '2020122700',
  102: '2020122706',
  108: '2020122712',
  114: '2020122718',
  120: '2020122800',
  126: '2020122806',
  132: '2020122812',
  138: '2020122818',
  144: '2020122900',
  150: '2020122906',
  156: '2020122912',
  162: '2020122918',
};

function updateWind(name) {
  getJSON(`wind2020/${windFiles[name]}.json`, (windData) => {
    const windImage = new Image();
    windData.image = windImage;
    windImage.src = `wind2020/${windFiles[name]}.png`;
    windImage.onload = () => {
      if (windLayer) {windLayer.wind.setWind(windData);}
      else {console.log("windLayer is NULL");}
    };
  });
}

export function loadControls() {
  document.getElementById('windgl2020-controls').appendChild(gui.domElement);
  gui.add(wind2020, '2020-12-23+h', 0, 162, 6).onFinishChange(updateWind);
  gui.add(wind2020, 'rotateStep', 20, 200, 10);
}
