precision mediump float;

#define M_PI 3.1415926535897932384626433832795

varying vec2 v_coords;
uniform float u_opacity;
uniform float u_heat_min;
uniform float u_heat_max;
uniform sampler2D u_heat;
uniform sampler2D u_color_ramp;

void main() {
  float heat = texture2D(u_heat, v_coords).r;
  float heat_t = (heat - u_heat_min) / (u_heat_max - u_heat_min);
  vec2 ramp_pos = vec2(fract(16.0 * heat_t), floor(16.0 * heat_t) / 16.0);

  gl_FragColor = vec4(texture2D(u_color_ramp, vec2(heat, heat)).xyz, u_opacity);
}