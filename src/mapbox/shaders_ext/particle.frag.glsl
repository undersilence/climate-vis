precision mediump float;

varying vec2 v_particle_pos;

void main() {
  gl_FragColor = vec4(v_particle_pos, 1.0, 1.0);
}