import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

export default [
  // browser-friendly UMD build
  {
    input: 'lib/index.js',
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    name: 'RcSlider',
    external: ["react", "react-dom"],
    plugins: [
      // typescript({
      //   verbosity: 3,
      //   clean: true,
      //   check: true,
      // }),
      resolve(), // so Rollup can find `ms`
      commonjs({
        namedExports: {
          'node_modules/my-lib/index.js': [ 'named' ]
        }
      }), // so Rollup can convert `ms` to an ES module
      replace({
        'process.env.NODE_ENV': JSON.stringify( 'production' )
      })
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
