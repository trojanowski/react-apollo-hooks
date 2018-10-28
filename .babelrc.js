module.exports = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        modules: process.env.ES_MODULES ? false : 'commonjs',
      },
    ],
  ],
};
