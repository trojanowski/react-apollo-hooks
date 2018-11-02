module.exports = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: process.env.ES_MODULES ? false : 'commonjs',
      },
    ],
  ],
};
