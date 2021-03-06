/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangyaju
 * @Date: 2020-10-16 15:25:15
 * @LastEditors: wangyaju
 * @LastEditTime: 2020-10-22 15:52:21
 */

export const ITERATE_KEY = Symbol("iterate");
let activeEffect;
export function effect(fn) {
  activeEffect = fn;
  fn();
}
export function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      track(target, null, key);
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      trigger(target, null, key);
      return res;
    }
  });
}

type Dep = Set<any>;
type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();
export function track(target, type, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  if (activeEffect && !deps.has(activeEffect)) {
    deps.add(activeEffect);
  }
}

export function trigger(target, type, key?: unknown, newValue?: unknown, oldValue?: unknown, oldTarget?: Map<unknown, unknown> | Set<unknown>) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  effects && effects.forEach(effect => effect());
}
