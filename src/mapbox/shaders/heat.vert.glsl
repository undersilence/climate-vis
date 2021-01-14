precision mediump float;
#define M_PI 3.1415926535897932384626433832795

// attribute vec2 a_pos;
// attribute vec2 a_coords;
attribute float a_index;

uniform float u_scale;
uniform float u_offset;
uniform float u_res;
uniform mat4 u_matrix;
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
  v_coords = vec2(
        fract(a_index / u_res),
        floor(a_index / u_res) / u_res);

  vec2 lnglat_coords = texcoords2LngLat(v_coords);
  lnglat_coords.y = clamp(lnglat_coords.y, -85.05112877980659, 85.05112877980659);
  vec2 mercator_coords = lngLat2NormWebMercator(lnglat_coords);

  vec4 heat = texture2D(u_heat, v_coords);
  gl_PointSize = 2.0;
  gl_Position = u_matrix * vec4(mercator_coords, u_scale * heat.x + u_offset, 1.0);
}