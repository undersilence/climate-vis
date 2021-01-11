import * as util from '/src/mapbox/util';

import heatVert from './shaders/heat.vert.glsl';
import heatFrag from './shaders/heat.frag.glsl';

import quadVert from './shaders/quad.vert.glsl';
import screenFrag from './shaders/screen.frag.glsl';

import { heatFiles, defaultRampColors } from '/src/const';

export default class HeatGL {
  constructor(gl) {
    this.gl = gl;

    this.scaleFactor = 0.1;
    this.resolution = 1024;
    this._numPixels = 1024 * 1024;

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

  set resolution(newRes) {
    const { gl } = this;
    this.resolution = newRes;
    this._numPixels = newRes * newRes;

    // each grid point have (x, y, z, w) four comps
    const gridState = new Uint8Array(this._numPixels * 4);
    for (let i = 0; i < gridState.length; i++) {
    }
  }

  setHeat(heatData) {
    this.heatData = heatData;
    this.heatTexture = util.createTexture(this.gl, this.gl.LINEAR, heatData.image);
  }

  updateHeat(name) {
    console.log('Updating heat: ', name);
    util.getJSON(`heat/${windFiles[name]}.json`, (windData) => {
      const windImage = new Image();
      windData.image = windImage;
      windImage.src = `heat/${windFiles[name]}.png`;
      windImage.onload = () => {
        this.setWind(windData);
      };
    });
  }

  draw(matrix) {
    const { gl } = this;
    gl.enable(gl.DEPTH_TEST);

    util.bindTexture(gl, this.heatTexture, 0);

    this.mvpMatrix = matrix;
    this.drawScreen();
  }

  drawScreen() {
    const { gl } = this;

    util.bindFramebuffer(gl, this.framebuffer, this.screenTexture);
    // render next context into screenTexture
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    this.drawHeatMap();
    util.bindFramebuffer(gl, null);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.drawTexture(this.screenTexture, 1.0);
    gl.disable(gl.BLEND);
  }

  drawHeapMap() {
    const { gl } = this;
    const shader = this.heatProgram;
    gl.useProgram(shader.program);

    gl.uniform1i(shader.u_heat, 0);
  }

  drawTexture(texture, opacity) {
    const { gl } = this;
    const program = this.screenProgram;
    gl.useProgram(program.program);

    util.bindAttribute(gl, this.quadBuffer, program.a_pos, 2);
    util.bindTexture(gl, texture, 2);
    gl.uniform1i(program.u_screen, 2);
    gl.uniform1f(program.u_opacity, opacity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
