precision mediump float;

varying vec2 v_coords;
uniform float u_opacity;
uniform sampler2D u_heat;
uniform sampler2D u_color_ramp;

void main() {
  vec4 heat = texture2D(u_heat, v_coords);
  gl_FragColor = vec4(texture2D(u_color_ramp, vec2(heat.x, heat.y)).xyz, u_opacity);
}