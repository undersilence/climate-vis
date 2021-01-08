import * as util from '/src/mapbox/util';
import WindGL from '/src/mapbox/windgl';

export const windLayer = {
  id: 'wind-layer',
  type: 'custom',
  wind: null,
  map: null,
  // Initialize here

  onAdd(map, gl) {
    this.map = map;
    this.wind = new WindHeatGL(gl);
    this.wind.numParticles = 65536;
    updateWind(0, this.wind);
  },

  // Render loop
  // WARNING: Run iff user triggered event
  render(gl, matrix) {
    if (this.wind.windData) {
      this.wind.draw(matrix);
      this.map.triggerRepaint();
      return true;
    }
    return false;
  },
};

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

function updateWind(name, wind) {
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
