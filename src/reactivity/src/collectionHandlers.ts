// import { callbackify, isObject } from "util";
import {
  isObject,
  capitalize,
  hasOwn,
  hasChanged,
  toRawType,
  isMap
} from "../../shared/src";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import { reactive, readonlyMap, Target, readonly, ReactiveFlags, toRaw } from "./reactive";
export type CollectionTypes = IterableCollections | WeakCollections;

type IterableCollections = Map<any, any> | Set<any>;
type WeakCollections = WeakMap<any, any> | WeakSet<any>;
type MapTypes = Map<any, any> | WeakMap<any, any>;
type SetTypes = Set<any> | WeakSet<any>
const toReactive = <T extends unknown>(value: T): T => (isObject(value) ? reactive(value) : value);
const toReadonly = <T extends unknown>(value: T): T => isObject(value) ? readonly(value as Record<any, any>) : value
const toShallow = <T extends unknown>(value: T) => value;
const getProto = <T extends CollectionTypes>(v: T): any => Reflect.getPrototypeOf(v)

function get(target: MapTypes, key: unknown, isReadonly = false, isShallow = false) {
  track(target, TrackOpTypes.GET, key);
  const wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
  return wrap(target.get(key));
}
function has(this: CollectionTypes, key: unknown, isReadonly = false): boolean {
  const target = (this as any)[ReactiveFlags.RAW]
  return target.has(key);
}
function size(target: IterableCollections, isReadonly = false) {
  // target =(target as any)
  // track()
  return Reflect.get(target, "size", target);
}
function add(this: SetTypes, value: unknown) {
  value = toRaw(value)
  const target = toRaw(this)
  const result = target.add(value);
  trigger(target, TriggerOpTypes.ADD, value, value);
  return result;
}
function set(this: MapTypes, key: unknown, value: unknown) {
  value = toRaw(value)
  const target = toRaw(this)
  const { has, get } = getProto(target)
  const oldValue = get.call(target, key)
  const result = target.set(key, value)
  trigger(target, TriggerOpTypes.SET, key, value, oldValue);
}

function deleteEntry(this: CollectionTypes, key: unknown) {
  const target = toRaw(this)
  const result = target.delete(key)
  trigger(target, TriggerOpTypes.DELETE, key, undefined, undefined)
  return result
}
function clear(this: IterableCollections) {
  const target = toRaw(this)
  const oldTarget = isMap(target) ? new Map(target) : new Set(target)
  const result = target.clear();
  trigger(target, TriggerOpTypes.CLEAR, undefined, undefined, oldTarget);
  return result;
}
function createForEach(isReadonly: boolean, isShallow: boolean) {
  return function forEach(this: IterableCollections, callback: Function, thisArg?: unknown) {
    const observed = this as any;
    const target = observed(ReactiveFlags.RAW)
    const wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
    return target.forEach((value: unknown, key: unknown) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}

function createInstrumentationGetter(isReadonly: boolean, shallow: boolean) {
  return false;
}

export const mutableCollectionHandlers = {
  get: createInstrumentationGetter(false, false)
};
