/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-16 15:33:52
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-21 17:00:12
 */


export const enum ReactiveFlags {
  SKIP = '__v_skip'
  IS_REACTIVE = '__v_isReactive'
  IS_READONLY = '__v_isReadonly'
  RAW = '__v_raw'
}

export const reactiveMap = new WeakMap<Target, any>()

export const readonlyMap = new WeakMap<Target, any>()

const enum TargetType {
  INVALID = 0,
  COMMON = 1,
  COLLECTION = 2
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.RAW]?: boolean
}

function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
      break;
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
      break;
    default:
      return TargetType.INVALID
      break;
  }
}

function getTargetType(value: Target) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value) ? TargetType.INVALID : targetTypeMap(toRawType(value))
}

export function reactive(fn) {
  fn();
}