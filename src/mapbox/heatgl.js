import * as util from '/src/mapbox/util';

import heatVert from './shaders/heat.vert.glsl';
import heatFrag from './shaders/heat.frag.glsl';

import quadVert from './shaders/quad.vert.glsl';
import screenFrag from './shaders/screen.frag.glsl';

import { heatFiles, defaultRampColors } from '/src/const';

export class HeatGL {
  constructor(gl) {
    this.gl = gl;

    this.scaleFactor = 0.1;
    this.resolution = 1024;

    this.quadBuffer = util.createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
    this.framebuffer = gl.createFramebuffer();
    this.mvpMatrix = null;

    this.heatProgram = util.createProgram(gl, heatVert, heatFrag);
    this.screenProgram = util.createProgram(gl, quadVert, screenFrag);

    this.setColorRamp(defaultRampColors);
  }

  setColorRamp(colors) {
    // lookup texture for colorizing the particles according to their speed
    this.colorRampTexture = util.createTexture(
      this.gl,
      this.gl.LINEAR,
      util.getColorRamp(colors),
      16,
      16,
    );
  }
}
