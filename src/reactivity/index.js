/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-16 10:49:43
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-16 11:09:19
 */
import { reactive, effect } from "./src";
function log() {
  console.log("测试");
}
console.log(reactive(log), effect(log));
const module = {
  reactive,
  effect
};
export default module;
