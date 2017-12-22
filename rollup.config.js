import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';

const env = process.env.NODE_ENV;
const config = [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      file: pkg['umd:main'],
      format: 'umd'
    },
    name: 'Slider',
    external: ["react", "react-dom"],
    globals: {
      "react": 'React',
      "react-dom": 'ReactDOM'
    },
    plugins: [
      typescript({
        include: ["src/*.js+(|x)", "src/**/*.js+(|x)"],
      }),
      resolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  },
  // commonjs
  {
    input: 'src/index.js',
    external: ["react", "react-dom", "classnames", "create-react-class", "dom-align", "prop-types"],
    output: [
      {file: pkg.main, format: 'cjs'},
    ],
    plugins: [
      typescript({
        include: ["src/*.js+(|x)", "src/**/*.js+(|x)"],
      }),
      resolve({
        jsnext: true
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  }
];

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config;
