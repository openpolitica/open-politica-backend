module.exports = {
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    "no-console": ["warn"],
    "no-unused-vars": ["error"],
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    es6: true,
    node: true,
  },
};
