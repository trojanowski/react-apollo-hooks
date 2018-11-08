import warning from 'warning';

export default function deprecated(func, message) {
  let warned = false;

  return (...args) => {
    if (!warned) {
      warning(false, message);
      warned = true;
    }

    return func(...args);
  };
}
