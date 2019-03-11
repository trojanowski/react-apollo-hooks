import { act } from 'react-dom/test-utils';

export default function actHack(callback: (() => void)) {
  if (process.env.NODE_ENV === 'test') {
    act(callback);
  } else {
    callback();
  }
}
