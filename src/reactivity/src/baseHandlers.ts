import { reactive, Target } from "./reactive";
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import { track, trigger, ITERATE_KEY } from "./effect";

const get = createSetter();

const arrayInstrumentations = {};

function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const result = Reflect.set(target, key, value, receiver);
    trigger(target, TriggerOpTypes.ADD, key, value);
    return result;
  };
}

const set = createSetter();
function deleteProperty(target: object, key: string | symbol): boolean {
  const oldValue = (target as any)[key];
  const result = Reflect.deleteProperty(target, key);
  trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue);
}
function has(target: object, key: string | symbol): boolean {
  const result = Reflect.has(target, key);
  track(target, TrackOpTypes.HAS, key);

  return result;
}

function ownKeys(target: object): (string | number | symbol)[] {
  track(target, TrackOpTypes.ITERATE, ITERATE_KEY);
  return Reflect.ownKeys(target);
}

export const mutableHandlers = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
};
