import * as util from '/src/mapbox/util';
import WindGL from '/src/mapbox/windgl';
import HeatGL from '/src/mapbox/heatgl';

export const windLayer = {
  id: 'wind-layer',
  type: 'custom',
  wind: null,
  map: null,
  // Initialize here

  onAdd(map, gl) {
    this.map = map;
    this.wind = new WindGL(gl);
    this.wind.numParticles = 65536;
    this.wind.updateWind(0);
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

export const heatLayer = {
  id: 'heat-layer',
  type: 'custom',
  heat: null,
  map: null,

  onAdd(map, gl) {
    this.map = map;
    this.heat = new HeatGL(gl);
    this.heat.resolution = 512;
    this.heat.updateHeat(0);
  },

  // Render loop
  // WARNING: Run iff user triggered event
  render(gl, matrix) {
    if (this.heat.heatData) {
      this.heat.draw(matrix);
      this.map.triggerRepaint();
      return true;
    }
    return false;
  },
};
