import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    name: 'RcSlider',
    plugins: [
      typescript({
        verbosity: 3,
        clean: true,
        check: true,
      }),
      // resolve(), // so Rollup can find `ms`
      // commonjs(), // so Rollup can convert `ms` to an ES module
      // jsx( {factory: 'React.createElement'} )
    ]
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // the `targets` option which can specify `dest` and `format`)
  // {
  // 	entry: 'src/index.ts',
  // 	external: ['ms'],
  // 	targets: [
  // 		{ dest: pkg.main, format: 'cjs' },
  // 		{ dest: pkg.module, format: 'es' }
  // 	]
  // }
];
