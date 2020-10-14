/*
 * @Description: 
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-14 14:48:49
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-14 15:27:56
 */
import { version } from '../package.json'
import foo from './foo.js'
export default ()=>{
  console.log(foo + 'version'+ version)
}