import { wrap } from "module";
import { callbackify, isObject } from "util";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import { reactive, Target } from "./reactive";
export type CollectionTypes = IterableCollections | WeakCollections;

type IterableCollections = Map<any, any> | Set<any>;
type WeakCollections = WeakMap<any, any> | WeakSet<any>;
type MapTypes = Map<any, any> | WeakMap<any, any>;
const toReactive = <T extends unknown>(value: T): T => (isObject(value) ? reactive(value) : value);
const toShallow = <T extends unknown>(value: T) => value;

function get(target: MapTypes, key: unknown) {
  track(target, TrackOpTypes.GET, key);
  const wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
  return wrap(target.get(key));
}
function has(this: CollectionTypes, key: unknown, isReadonly = false): boolean {
  return target.has(key);
}
function size(target: IterableCollections, isReadonly = false) {
  // target =(target as any)
  // track()
  return Reflect.get(target, "size", target);
}
function add(value: unknown) {
  const result = trigger.add(value);
  trigger(target, TriggerOpTypes.ADD, value, value);
  return result;
}
function set() {
  trigger(target, TriggerOpTypes.SET, key, value, oldValue);
}

function deleteEntry(this: CollectionTypes, key: unknown) {}
function clear(this: IterableCollections) {
  const result = target.clear();
  trigger(target, TriggerOpTypes.CLEAR, undefined, undefined, oldTarget);
  return result;
}
function createForEach(isReadonly: boolean, isShallow: boolean) {
  return function forEach(this: IterableCollections, callback: Function, thisArg?: unknown) {
    const observed = this as any;
    const wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
    return target.forEach((value: unknown, key: unknown) => {
      return callbackify.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}

function createInstrumentationGetter(isReadonly: boolean, shallow: boolean) {
  return false;
}

export const mutableCollectionHandlers = {
  get: createInstrumentationGetter(false, false)
};
