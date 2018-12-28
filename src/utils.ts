import isPlainObject from 'lodash/isPlainObject';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function objToKey(obj: Record<string, any>): null | string {
  if (!obj) {
    return null;
  }
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      const value = obj[key];
      result[key] = isPlainObject(value) ? objToKey(obj[key]) : obj[key];
      return result;
    }, {});
  return JSON.stringify(sortedObj);
}
