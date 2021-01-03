import * as dat from 'dat.gui';
import WindGL from './windgl';

// using var to work around a WebKit bug
var canvas = document.getElementById('canvas'); // eslint-disable-line

const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext('webgl', { antialiasing: false });

const wind = new WindGL(gl);
window.wind = wind;
wind.numParticles = 65536;

function frame() {
  if (wind.windData) {
    wind.draw();
  }
  requestAnimationFrame(frame);
}
frame();

const gui = new dat.GUI({ autoPlace: false });
document.getElementById('windgl-controls').appendChild(gui.domElement);
gui.add(wind, 'numParticles', 1024, 589824);
gui.add(wind, 'fadeOpacity', 0.96, 0.999).step(0.001).updateDisplay();
gui.add(wind, 'speedFactor', 0.05, 1.0);
gui.add(wind, 'dropRate', 0, 0.1);
gui.add(wind, 'dropRateBump', 0, 0.2);

const windFiles = {
  0: '2016112000',
  6: '2016112006',
  12: '2016112012',
  18: '2016112018',
  24: '2016112100',
  30: '2016112106',
  36: '2016112112',
  42: '2016112118',
  48: '2016112200',
};

const meta = {
  '2016-11-20+h': 0,
  'retina resolution': true,
};
gui.add(meta, '2016-11-20+h', 0, 48, 6).onFinishChange(updateWind);
if (pxRatio !== 1) {
  gui.add(meta, 'retina resolution').onFinishChange(updateRetina);
}
updateWind(0);
updateRetina();

function updateRetina() {
  const ratio = meta['retina resolution'] ? pxRatio : 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  wind.resize();
}

getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_coastline.geojson', (data) => {
  const lineCanvas = document.getElementById('coastline');
  lineCanvas.width = lineCanvas.clientWidth * pxRatio;
  lineCanvas.height = lineCanvas.clientHeight * pxRatio;

  const ctx = lineCanvas.getContext('2d');
  ctx.lineWidth = pxRatio;
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.strokeStyle = 'white';
  ctx.beginPath();

  for (let i = 0; i < data.features.length; i++) {
    const line = data.features[i].geometry.coordinates;
    for (let j = 0; j < line.length; j++) {
      ctx[j ? 'lineTo' : 'moveTo'](
        (line[j][0] + 180) * lineCanvas.width / 360,
        (-line[j][1] + 90) * lineCanvas.height / 180,
      );
    }
  }
  ctx.stroke();
});

function updateWind(name) {
  getJSON(`wind/${windFiles[name]}.json`, (windData) => {
    const windImage = new Image();
    windData.image = windImage;
    windImage.src = `wind/${windFiles[name]}.png`;
    windImage.onload = () => {
      wind.setWind(windData);
    };
  });
}

function getJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.open('get', url, true);
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback(xhr.response);
    } else {
      throw new Error(xhr.statusText);
    }
  };
  xhr.send();
}
