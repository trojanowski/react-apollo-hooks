module.exports = {
  presets: [
    '@babel/preset-react',
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: process.env.ES_MODULES ? false : 'commonjs',
        targets: process.env.NODE_ENV !== 'test' ? undefined : { node: true },
      },
    ],
  ],
};
