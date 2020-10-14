import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import { eslint } from 'rollup-plugin-eslint';
import pkg, { version } from './package.json'
import typescript from 'rollup-plugin-typescript2'

import replace  from 'rollup-plugin-replace';
import { pathToFileURL } from 'url';
const path = require('path')

const VERSION = process.env.VERSION || version
const copyright = new Date().getFullYear() > 2018 ? '2018-' + new Date().getFullYear() : 2018;

const banner =
  '/*!\n' +
  ' * idebug v' + VERSION + '\n' +
  ' * (c) ' + copyright + ' Weich\n' +
  ' * Released under the MIT License.\n' +
  ' */';

const extensions = ['.js', '.ts']
const resolve = function(...args){
  return path.resolve(__dirname,...args)
}
export default {
  input: resolve('src/index.ts'),
  output: [{
    file: 'dist/bundle.cjs.js',
    format: 'cjs',
    sourcemap: true,
  }, {
    file: 'dist/bundle.umd.js',
    name: 'moduleName',
    format: 'umd',
    sourcemap: true,
  }, {
    file: 'dist/bundle.es.js',
    format: 'es'
  }],

  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ['src/**'],
      exclude: ['node_modules/**']
    }),
    typescript(),
    json(),
    nodeResolve({
      extensions
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    uglify({
        output: {
          comments: function(node, comment) {
            console.log(node, comment)
              var text = comment.value;
              var type = comment.type;
              if (type == "comment2") {
                  // multiline comment
                  return /idebug|ENVIRONMENT/i.test(text);
              }
          }
        }
      }
    )
  ],

}