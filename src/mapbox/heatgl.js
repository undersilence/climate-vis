// import mapboxgl from 'mapbox-gl';
import * as util from './util';
import mapboxgl from 'mapbox-gl';

import heatVert from './shaders/heat.vert.glsl';
import heatFrag from './shaders/heat.frag.glsl';

import quadVert from './shaders/quad.vert.glsl';
import screenFrag from './shaders/screen.frag.glsl';

import {
  heatFiles, defaultRampColors, LNG_MAX, LNG_MIN, LAT_MAX, LAT_MIN,
} from '/src/const';

export default class HeatGL {
  constructor(gl) {
    this.gl = gl;

    // attributes
    this.scale = 0.1;
    this.offset = 0.0;
    this.opacity = 0.6;
    this.showMesh = false;

    this.quadBuffer = util.createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
    this.framebuffer = gl.createFramebuffer();
    this.mvpMatrix = null;

    this.heatProgram = util.createProgram(gl, heatVert, heatFrag);
    this.screenProgram = util.createProgram(gl, quadVert, screenFrag);

    this.setColorRamp(defaultRampColors);
    this.resize();
  }

  resize() {
    const { gl } = this;
    const emptyPixels = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);

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

  set resolution(newRes) {
    const { gl } = this;
    // this.resolution = newRes;
    this._res = Math.floor(newRes);
    // each grid point have (x, y, z, w) four comps
    const gridIndices = new Float32Array(this._res * this._res);
    const trianglesIndex = [];
    const linesIndex = [];
    const gridData = [];
    this._numGrids = 0;
    this._numTriangles = 0;
    this._numLines = 0;

    for (let i = 0, k = 0; i < this._res; i++) {
      for (let j = 0; j < this._res; j++, k++) {
        gridIndices[k] = k;
        if (k > this._res && (k % this._res) !== 0) {
          const a = k - this._res - 1;
          const b = k - this._res;
          const c = k - 1;
          const d = k;
          trianglesIndex.push(a, b, c, d, c, b);
          this._numTriangles += 6;

          linesIndex.push(c, d, b, d);
          this._numLines += 4;
          // in first row
          if (k < this._res + this._res) {
            linesIndex.push(a, b);
            this._numLines += 2;
          }
          // in first col
          if ((k % this._res) === 1) {
            linesIndex.push(a, c);
            this._numLines += 2;
          }
        }
      }
    }
    /*
    for (let i = 0, k = 0; i < this._res; i++) {
      const v = i / (this._res - 1);
      const lat = util.lerp(LAT_MAX, LAT_MIN, v);

      if (lat <= 85.05112877980659 && lat >= -85.05112877980659) {
        for (let j = 0; j < this._res; j++, k++) {
          const u = j / (this._res - 1);
          const lng = util.lerp(LNG_MIN, LNG_MAX, u);
          const res = mapboxgl.MercatorCoordinate.fromLngLat({ lng, lat });

          gridData.push(res.x, res.y, u, v);
          this._numGrids++;
          // @ MetaRu
          // Generate quad index
          if (k > this._res && (k % this._res) !== 0) {
            const a = k - this._res - 1;
            const b = k - this._res;
            const c = k - 1;
            const d = k;
            trianglesIndex.push(a, b, c, d, c, b);
            this._numTriangles += 6;

            linesIndex.push(c, d, b, d);
            this._numLines += 4;
            // in first row
            if (k < this._res + this._res) {
              linesIndex.push(a, b);
              this._numLines += 2;
            }
            // in first col
            if ((k % this._res) === 1) {
              linesIndex.push(a, c);
              this._numLines += 2;
            }
          }
          // console.log(`diff(${j / (this._res - 1) - res.x}, ${i / (this._res - 1) - res.y})`);
        }
      }
    }
    */

    this.gridIndexBuffer = util.createBuffer(gl, gridIndices);
    this.gridDataBuffer = util.createBuffer(gl, new Float32Array(gridData));
    this.trianglesIndexBuffer = util.createIndexBuffer(gl, new Uint32Array(trianglesIndex));
    this.linesIndexBuffer = util.createIndexBuffer(gl, new Uint32Array(linesIndex));
    // console.log(new Float32Array(this.gridPos));
  }

  get resolution() {
    return this._res;
  }

  setheat(heatData) {
    // heatData.array = new Float32Array(heatData.array);
    // @MetaRu test big triangle
    // heatData.array = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    // heatData.length = 6;
    //
    this.heatData = heatData;
    this.heatTexture = util.createTexture(this.gl, this.gl.LINEAR, heatData.image);
  }

  updateHeat(name) {
    console.log('Updating heat: ', name);
    util.getJSON(`heat/${heatFiles[name]}.json`, (heatData) => {
      const heatImage = new Image();
      heatData.image = heatImage;
      heatImage.src = `heat/${heatFiles[name]}.png`;
      heatImage.onload = () => {
        this.setheat(heatData);
      };
    });
  }

  draw(matrix) {
    const { gl } = this;
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LESS);
    // gl.clear(gl.GL_COLOR_BUFFER_BIT);
    // gl.clear(gl.GL_DEPTH_BUFFER_BIT);

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

  drawHeatMap() {
    const { gl, mvpMatrix } = this;
    const shader = this.heatProgram;
    gl.useProgram(shader.program);

    // util.bindAttribute(gl, this.gridPosBuffer, shader.a_pos, 2);
    // util.bindAttribute(gl, this.gridIndexBuffer, shader.a_index, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.gridDataBuffer);

    // gl.enableVertexAttribArray(shader.a_pos);
    // gl.enableVertexAttribArray(shader.a_coords);
    gl.enableVertexAttribArray(shader.a_index);
    // gl.vertexAttribPointer(shader.a_pos, 2, gl.FLOAT, false, 4 * 4, 0);
    // gl.vertexAttribPointer(shader.a_coords, 2, gl.FLOAT, false, 4 * 4, 4 * 2);
    util.bindAttribute(gl, this.gridIndexBuffer, shader.a_index, 1);
    util.bindTexture(gl, this.colorRampTexture, 2);

    gl.uniform1f(shader.u_scale, this.scale);
    gl.uniform1f(shader.u_offset, this.offset);
    gl.uniform1f(shader.u_res, this.resolution);
    gl.uniform1f(shader.u_opacity, this.opacity);
    gl.uniform1i(shader.u_heat, 0);
    gl.uniform1i(shader.u_color_ramp, 2);
    gl.uniform1f(shader.u_heat_min, this.heatData.tMin);
    gl.uniform1f(shader.u_heat_max, this.heatData.tMax);

    // gl.uniform1f(shader.u_max_heat, this.heatData.maxHeat);
    gl.uniformMatrix4fv(shader.u_matrix, false, mvpMatrix);

    // @MetaRu
    // stride attr must set!
    // otherwise trigger wired GL bugs, attribute would wrong cause false offset.

    // console.log(`drawArrays length:${this.heatData.length}`);
    if (this.showMesh) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesIndexBuffer);
      // console.log(`_numTriangles:${this._numTriangles}`);
      // gl.drawElements(gl.LINES, this._numTriangles, gl.UNSIGNED_SHORT, 0);
      // @MetaRu
      // need open WebGL extensions 'OES_element_index_uint'
      // to supprt gl.UNSIGNED_INT indexBuffer
      // gl.drawElements(gl.LINE_STRIP, this._numTriangles, gl.UNSIGNED_INT, 0);
      gl.drawElements(gl.TRIANGLES, this._numTriangles, gl.UNSIGNED_INT, 0);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linesIndexBuffer);
      // console.log(`_numLines:${this._numLines}`);
      gl.drawElements(gl.LINES, this._numLines, gl.UNSIGNED_INT, 0);
    }
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

// @ MetaRu
// using hardcode MercatorCoordinate is a totally bad idea
// it broken when 'lat' near 85° or -85°, and it's not linear.
// trash zhihu post -> (https://zhuanlan.zhihu.com/p/165106392)

/*
export function convertLngLatCSV(csvstr) {
  const tempArr = csvstr.split('\n');
  const res = {
    array: [],
    length: 0,
  };
  for (let i = 0; i < tempArr.length; i++) {
    const element = tempArr[i];
    const tempElemts = element.split(',');
    // console.log(tempElemts);
    const testPos = {
      x: Number(tempElemts[0]),
      y: Number(tempElemts[1]),
    };
    const normPos = mapboxgl.MercatorCoordinate
      .fromLngLat({
        lng: Number(tempElemts[0]) - 180.0,
        lat: Number(tempElemts[1]),
      });

    console.log(`testPos(${testPos.x}, ${testPos.y})`);
    console.log(`normPos(${normPos.x}, ${normPos.y})`);
    res.array.push(normPos.x);
    res.array.push(normPos.y);
    for (let j = 2; j < tempElemts.length; j++) {
      res.array.push(tempElemts[j]);
    }
    res.length++;
  }
  return res;
}
*/
