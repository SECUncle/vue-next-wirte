/*
 * @Description: 
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-21 14:16:48
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-22 16:46:41
 */

declare const RefSymbol: unique symbol
export interface Ref<T = any> {
  value: T
  [RefSymbol]: true
  _shallow?: boolean
}

export type UnwrapRef<T> = T extends Ref<infer V> ? '' : null
