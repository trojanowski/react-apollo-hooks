import isPlainObject from 'lodash/isPlainObject';

export default function objToKey(obj) {
  if (!obj) {
    return null;
  }
  const keys = Object.keys(obj);
  keys.sort();
  const sortedObj = keys.reduce((result, key) => {
    const value = obj[key];
    if (isPlainObject(value)) {
      result[key] = objToKey(obj[key]);
    } else {
      result[key] = obj[key];
    }
    return result;
  }, {});
  return JSON.stringify(sortedObj);
}
