module.exports = {
  env: {
    es2021: true,
    node: true
  },
  root: true,
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    Server: true,
    redis: true,
    logger: true,
    plugin: true
  },
  rules: {
    eqeqeq: ['off'],
    'prefer-const': ['off'],
    'arrow-body-style': 'off'
  }
}
