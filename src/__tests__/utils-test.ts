import { compact } from '../utils';

describe('compact', () => {
  it('returns a new object omitting any keys with an undefined value', () => {
    const compacted = compact({ a: 'value', b: 1, c: undefined });
    expect(compacted.hasOwnProperty('c')).toBe(false);
  });
});
