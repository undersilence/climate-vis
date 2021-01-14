precision mediump float;
#define M_PI 3.1415926535897932384626433832795

attribute float a_index;
uniform sampler2D u_particles;
uniform float u_particles_res;
uniform mat4 u_matrix;

uniform sampler2D u_wind;
uniform vec2 u_wind_min;
uniform vec2 u_wind_max;

varying vec2 v_particle_pos;

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
    vec4 color = texture2D(u_particles, vec2(
        fract(a_index / u_particles_res),
        floor(a_index / u_particles_res) / u_particles_res));

    // decode current particle position from the pixel's RGBA value
    v_particle_pos = vec2(
        color.r / 255.0 + color.b,
        color.g / 255.0 + color.a);

    vec2 velocity = mix(u_wind_min, u_wind_max, texture2D(u_wind, v_particle_pos).rg);
    float speed_t = length(velocity) / length(u_wind_max);

    gl_PointSize = 1.0;
    vec2 fixed_particle_pos = texcoords2LngLat(v_particle_pos);
    if(fixed_particle_pos.y > 85.05112877980659 || fixed_particle_pos.y < -85.05112877980659) {
        fixed_particle_pos = vec2(0, 0);
    }
    fixed_particle_pos = lngLat2NormWebMercator(fixed_particle_pos);

    // gl_Position = u_matrix * vec4(v_particle_pos.x, v_particle_pos.y, 0, 1);
    gl_Position = u_matrix * vec4(fixed_particle_pos.x, fixed_particle_pos.y,speed_t * 0.02, 1);
}
