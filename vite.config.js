function glsl() {
  return {
    name: 'glsl',
    // eslint-disable-next-line consistent-return
    transform(code, id) {
      if (/.*\.glsl/.test(id)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: null,
        };
      }
    },
  };
}

export default {
  plugins: [
    glsl(),
  ],
};
