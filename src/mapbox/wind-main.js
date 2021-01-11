import * as util from '/src/mapbox/util';
import WindGL from '/src/mapbox/windgl';
import pVert from './shaders_ext/particle.vert.glsl';
import pFrag from './shaders_ext/particle.frag.glsl';

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
  },
};
