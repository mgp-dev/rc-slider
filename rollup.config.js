import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      file: pkg.browser,
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
    external: ["react", "react-dom"],
    output: [
      {file: pkg.main, format: 'cjs'},
    ],
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
  }
];
