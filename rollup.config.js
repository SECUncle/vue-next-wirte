/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-14 14:55:27
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-15 11:18:29
 */
import json from "rollup-plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";
// import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
// import { uglify } from "rollup-plugin-uglify";
import { eslint } from "rollup-plugin-eslint";
import pkg, { version } from "./package.json";
import typescript from "rollup-plugin-typescript2";

// import replace  from 'rollup-plugin-replace';
const path = require("path");

const VERSION = process.env.VERSION || version;
const copyright = new Date().getFullYear() > 2020 ? "2020-" + new Date().getFullYear() : 2018;

const banner =
  "/*!\n" +
  " * idebug v" +
  VERSION +
  "\n" +
  " * (c) " +
  copyright +
  " Weich\n" +
  " * Released under the MIT License.\n" +
  " */";

const extensions = [".js", ".ts"];
const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};
export default {
  input: `src/index.ts`,
  output: [
    { file: "dist/vue-next-core-write.global.js", format: "iife", sourcemap: true, name: "Vue" }
  ],
  watch: {
    include: 'src/**'
  },

  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ["src/**"],
      exclude: ["node_modules/**"],
    }),
    typescript({ useTsconfigDeclarationDir: true }),
    json(),
    nodeResolve({
      extensions,
    }),
    commonjs(),
    // babel({
    //   exclude: "node_modules/**",
    // }),
    // uglify({
    //   output: {
    //     comments: function (node, comment) {
    //       console.log(node, comment);
    //       var text = comment.value;
    //       var type = comment.type;
    //       if (type == "comment2") {
    //         // multiline comment
    //         return /idebug|ENVIRONMENT/i.test(text);
    //       }
    //     },
    //   },
    // }),
  ],
};
