precision mediump float;
#define M_PI 3.1415926535897932384626433832795

attribute vec2 a_pos;
attribute vec2 a_coords;

uniform float u_scale;
uniform float u_res;
uniform mat4 u_matrix;
uniform float u_max_heat;
uniform sampler2D u_heat;

varying vec2 v_coords;

vec2 texcoords2LngLat(vec2 texcoords) {
    return vec2(mix(-180.0, 180.0, texcoords.x), mix(-90.0, 90.0, texcoords.y));
}

vec2 lngLat2NormWebMercator(vec2 lngLat) {
    vec2 mercator;
    mercator.x = (lngLat.x / 180.0 + 1.0) * 0.5;
    mercator.y = (log(tan((90.0 + lngLat.y)* M_PI / 360.0))/M_PI + 1.0) * 0.5;
    return mercator;
}

void main() {
  v_coords = a_coords;

  vec4 heat = texture2D(u_heat, v_coords);
  gl_PointSize = 2.0;
  gl_Position = u_matrix * vec4(a_pos, u_scale * heat.x, 1.0);
}