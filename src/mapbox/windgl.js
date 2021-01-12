import * as util from './util';

import drawVert from './shaders/draw.vert.glsl';
import drawFrag from './shaders/draw.frag.glsl';

import quadVert from './shaders/quad.vert.glsl';

import screenFrag from './shaders/screen.frag.glsl';
import updateFrag from './shaders/update.frag.glsl';

import { windFiles, defaultRampColors } from '/src/const';

export default class WindGL {
  constructor(gl) {
    this.gl = gl;

    // attributes
    this.fadeOpacity = 0.95; // how fast the particle trails fade on each frame
    this.speedFactor = 0.25; // how fast the particles move
    this.dropRate = 0.003; // how often the particles move to a random place
    this.dropRateBump = 0.01; // drop rate increase relative to individual particle speed

    this.drawProgram = util.createProgram(gl, drawVert, drawFrag);
    this.screenProgram = util.createProgram(gl, quadVert, screenFrag);
    this.updateProgram = util.createProgram(gl, quadVert, updateFrag);

    this.quadBuffer = util.createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
    this.framebuffer = gl.createFramebuffer();
    this.mvpMatrix = null;
    this.retina = false;
    this.numParticles = 65536;

    this.setColorRamp(defaultRampColors);
    this.resize();
  }

  resize() {
    const { gl } = this;
    const emptyPixels = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
    // screen textures to hold the drawn screen for the previous and the current frame
    this.backgroundTexture = util.createTexture(
      gl,
      gl.NEAREST,
      emptyPixels,
      gl.canvas.width,
      gl.canvas.height,
    );
    this.screenTexture = util.createTexture(
      gl,
      gl.NEAREST,
      emptyPixels,
      gl.canvas.width,
      gl.canvas.height,
    );
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

  set numParticles(numParticles) {
    const { gl } = this;

    // we create a square texture where each pixel will hold a particle position encoded as RGBA
    const particleRes = this.particleStateResolution = Math.ceil(Math.sqrt(numParticles));
    this._numParticles = particleRes * particleRes;

    const particleState = new Uint8Array(this._numParticles * 4);
    for (let i = 0; i < particleState.length; i++) {
      // randomize the initial particle positions
      particleState[i] = Math.floor(Math.random() * 256);
    }
    // textures to hold the particle state for the current and the next frame
    this.particleStateTexture0 = util.createTexture(
      gl,
      gl.NEAREST,
      particleState,
      particleRes,
      particleRes,
    );
    this.particleStateTexture1 = util.createTexture(
      gl,
      gl.NEAREST,
      particleState,
      particleRes,
      particleRes,
    );

    const particleIndices = new Float32Array(this._numParticles);
    for (let i = 0; i < this._numParticles; i++) particleIndices[i] = i;
    this.particleIndexBuffer = util.createBuffer(gl, particleIndices);
  }

  get numParticles() {
    return this._numParticles;
  }

  setWind(windData) {
    this.windData = windData;
    this.windTexture = util.createTexture(this.gl, this.gl.LINEAR, windData.image);
  }

  updateWind(name) {
    console.log('Updating wind: ', name);
    util.getJSON(`wind2020/${windFiles[name]}.json`, (windData) => {
      const windImage = new Image();
      windData.image = windImage;
      windImage.src = `wind2020/${windFiles[name]}.png`;
      windImage.onload = () => {
        this.setWind(windData);
      };
    });
  }

  updateRetina(retina) {
    console.log('Turing Retina: ', retina);
    const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
    this.retina = retina;
    const ratio = this.retina ? pxRatio : 1;
    this.gl.canvas.width = this.gl.canvas.clientWidth * ratio;
    this.gl.canvas.height = this.gl.canvas.clientHeight * ratio;
    this.resize();
  }

  draw(matrix) {
    const { gl } = this;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);

    util.bindTexture(gl, this.windTexture, 0);
    util.bindTexture(gl, this.particleStateTexture0, 1);

    // console.log(matrix);
    this.mvpMatrix = matrix;
    this.drawScreen();
    this.updateParticles();
  }

  drawScreen() {
    const { gl } = this;
    // draw the screen into a temporary framebuffer to retain it as the background on the next frame
    util.bindFramebuffer(gl, this.framebuffer, this.screenTexture);

    // @ MetaRu(UnderSilence)
    // clear screenTextures' colorbuffer, otherwise tails can't fade out.
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.drawTexture(this.backgroundTexture, this.fadeOpacity);
    this.drawParticles();
    util.bindFramebuffer(gl, null);
    // enable blending to support drawing on top of an existing background (e.g. a map)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.drawTexture(this.screenTexture, 1.0);
    gl.disable(gl.BLEND);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // save the current screen as the background for the next frame
    const temp = this.backgroundTexture;
    this.backgroundTexture = this.screenTexture;
    this.screenTexture = temp;
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

  drawParticles() {
    const { gl } = this;
    const program = this.drawProgram;
    gl.useProgram(program.program);

    util.bindAttribute(gl, this.particleIndexBuffer, program.a_index, 1);
    util.bindTexture(gl, this.colorRampTexture, 2);

    gl.uniform1i(program.u_wind, 0);
    gl.uniform1i(program.u_particles, 1);
    gl.uniform1i(program.u_color_ramp, 2);

    gl.uniform1f(program.u_particles_res, this.particleStateResolution);
    gl.uniform2f(program.u_wind_min, this.windData.uMin, this.windData.vMin);
    gl.uniform2f(program.u_wind_max, this.windData.uMax, this.windData.vMax);
    gl.uniformMatrix4fv(program.u_matrix, false, this.mvpMatrix);

    gl.drawArrays(gl.POINTS, 0, this._numParticles);
  }

  updateParticles() {
    const { gl } = this;
    util.bindFramebuffer(gl, this.framebuffer, this.particleStateTexture1);
    gl.viewport(0, 0, this.particleStateResolution, this.particleStateResolution);

    const program = this.updateProgram;
    gl.useProgram(program.program);

    util.bindAttribute(gl, this.quadBuffer, program.a_pos, 2);

    gl.uniform1i(program.u_wind, 0);
    gl.uniform1i(program.u_particles, 1);

    gl.uniform1f(program.u_rand_seed, Math.random());
    gl.uniform2f(program.u_wind_res, this.windData.width, this.windData.height);
    gl.uniform2f(program.u_wind_min, this.windData.uMin, this.windData.vMin);
    gl.uniform2f(program.u_wind_max, this.windData.uMax, this.windData.vMax);
    gl.uniform1f(program.u_speed_factor, this.speedFactor);
    gl.uniform1f(program.u_drop_rate, this.dropRate);
    gl.uniform1f(program.u_drop_rate_bump, this.dropRateBump);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // swap the particle state textures so the new one becomes the current one
    const temp = this.particleStateTexture0;
    this.particleStateTexture0 = this.particleStateTexture1;
    this.particleStateTexture1 = temp;
  }
}
