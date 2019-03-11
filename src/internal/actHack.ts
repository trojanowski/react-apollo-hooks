import { act } from 'react-dom/test-utils';

export default function actHack(callback: (() => void)) {
  // @ts-ignore process is not known
  if (process.env.NODE_ENV === 'test') {
    act(callback);
  } else {
    callback();
  }
}
