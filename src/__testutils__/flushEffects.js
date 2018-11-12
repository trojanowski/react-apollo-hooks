import { render } from 'react-testing-library';

// Run queued `useEffect` hooks.
// Required until these issues are fixed:
// https://github.com/kentcdodds/react-testing-library/issues/215
// https://github.com/facebook/react/issues/14050
export default function flushEffects() {
  render(null);
}
