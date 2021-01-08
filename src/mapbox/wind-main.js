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
  },

  // Render loop
  // WARNING: Run iff user triggered event
  render(gl, matrix) {
    if (this.wind.windData) {
      this.wind.draw(matrix);
      this.map.triggerRepaint();
      return true;
    }
    updateWind(0, this.wind);
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

/*
export function onLoad(map, gl) {
  // create GLSL source for vertex shader
  const vertexSource = ''
    + 'uniform mat4 u_matrix;'
    + 'attribute vec2 a_pos;'
    + 'void main() {'
    + '    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);'
    + '}';

  // create GLSL source for fragment shader
  const fragmentSource = ''
    + 'void main() {'
    + '    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);'
    + '}';

  // // create a vertex shader
  // const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  // gl.shaderSource(vertexShader, vertexSource);
  // gl.compileShader(vertexShader);

  // // create a fragment shader
  // const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  // gl.shaderSource(fragmentShader, fragmentSource);
  // gl.compileShader(fragmentShader);

  // link the two shaders into a WebGL program
  const program = util.createProgram(gl, vertexSource, fragmentSource);
  this.program = program.program;
  gl.linkProgram(this.program);

  this.aPos = gl.getAttribLocation(this.program, 'a_pos');

  // define vertices of the triangle to be rendered in the custom style layer
  const helsinki = mapboxgl.MercatorCoordinate.fromLngLat({
    lng: 25.004,
    lat: 60.239,
  });
  const berlin = mapboxgl.MercatorCoordinate.fromLngLat({
    lng: 13.403,
    lat: 52.562,
  });
  const kyiv = mapboxgl.MercatorCoordinate.fromLngLat({
    lng: 30.498,
    lat: 50.541,
  });

  // console.log(helsinki, berlin, kyiv);
  // create and initialize a WebGLBuffer to store vertex and color data
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      helsinki.x,
      helsinki.y,
      berlin.x,
      berlin.y,
      kyiv.x,
      kyiv.y,
    ]),
    gl.STATIC_DRAW,
  );

  this.wind = new WindGL(gl);
  this.wind.numParticles = 65536;
}

export function onUpdate(gl, matrix) {
  gl.useProgram(this.program);
  gl.uniformMatrix4fv(
    gl.getUniformLocation(this.program, 'u_matrix'),
    false,
    matrix,
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.enableVertexAttribArray(this.aPos);
  gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);

  if (this.wind.windData) {
    this.wind.draw(matrix);
  }
  updateWind(0, this.wind);
}
*/

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
