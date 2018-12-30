import isPlainObject from 'lodash/isPlainObject';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function objToKey<T extends Record<string, any>>(obj: T): T | string {
  if (!isPlainObject(obj)) {
    return obj;
  }
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      result[key] = objToKey(obj[key]);
      return result;
    }, {});
  return JSON.stringify(sortedObj);
}
