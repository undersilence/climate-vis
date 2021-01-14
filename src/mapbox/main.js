import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '/src/const';
import { windLayer } from './wind-main';
import { loadControls } from './controls';

mapboxgl.accessToken = MAPBOX_TOKEN;
export const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [121.48, 31.22],
  zoom: 5,
  pitch: 45,
  bearing: -17.6,
  renderWorldCopies: false,
  antialias: true,
  // minZoom: 2,
});

loadControls(map);

// create a custom style layer to implement the WebGL content
const highlightLayer = {
  id: 'highlight',
  type: 'custom',

  // method called when the layer is added to the map
  // https://docs.mapbox.com/mapbox-gl-js/api/#styleimageinterface#onadd
  onAdd(map, gl) {
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

    // create a vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);

    // create a fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);

    // link the two shaders into a WebGL program
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
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

    // create and initialize a WebGLBuffer to store vertex and color data
    console.log(`example ${new Float32Array([
      helsinki.x,
      helsinki.y,
      berlin.x,
      berlin.y,
      kyiv.x,
      kyiv.y,
    ])}`);
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
  },

  // method fired on each animation frame
  // https://docs.mapbox.com/mapbox-gl-js/api/#map.event:render
  render(gl, matrix) {
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
  },
};

map.on('load', () => {
  // Start the animation.
  // Add 3d buildings and remove label layers to enhance the map
  const { layers } = map.getStyle();
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
      // remove text labels
      map.removeLayer(layers[i].id);
    }
  }
  // map.addLayer(windLayer);
  // map.addLayer(highlightLayer);
});

map.on('wheel', () => {
  if (windLayer.wind) { windLayer.wind.resize(); }
});
map.on('dragstart', () => {
  if (windLayer.wind) { windLayer.wind.resize(); }
});
map.on('move', () => {
  if (windLayer.wind) { windLayer.wind.resize(); }
});
