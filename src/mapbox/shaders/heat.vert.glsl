precision mediump float;

attribute vec2 a_pos;
attribute vec2 a_coords;

uniform float u_scale;
uniform float u_res;
uniform mat4 u_matrix;
uniform float u_max_heat;
uniform sampler2D u_heat;

varying vec2 v_coords;

void main() {
  v_coords = a_coords;

  vec4 heat = texture2D(u_heat, v_coords);
  gl_PointSize = 2.0;
  gl_Position = u_matrix * vec4(a_pos, u_scale * heat.x, 1.0);
}