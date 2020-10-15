/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-14 17:00:15
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-15 16:27:09
 */
import { effect } from './reactive'
function aa() {
  console.log('add')
}

effect(aa)
