module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      alias: [
        /**
         * 由于 vite 使用 / 代表项目根目录
         * 而 eslint 和 vscode 都会认为这是一个绝对路径
         * 所以需要分别在 eslint 的配置文件和 jsconfig.json 中配置 alias
         * 这里只配置 src 文件夹，因为项目中的 js 源码都在 src 下
         */
        ['/src', './src'],
      ],
    },
  },
  rules: {
    'no-use-before-define': 'off',
    'no-mixed-operators': 'off',
    'no-multi-assign': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'import/prefer-default-export': 'off',
    'import/no-absolute-path': 'off',
    'linebreak-style': 'off',
  },
};
