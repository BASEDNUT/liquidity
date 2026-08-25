import assert from 'node:assert/strict';
import { describeRunway } from '../src/utils/runway.mjs';

assert.deepEqual(describeRunway(0, 0, 0), {
  kind: 'empty',
  message: 'Enter values → runway',
});
assert.deepEqual(describeRunway(100, 25, 5), {
  kind: 'finite',
  days: 5,
  netBurn: 20,
  message: '5.0 days · net burn /day',
});
assert.deepEqual(describeRunway(100, 25, 25), {
  kind: 'self-funding',
  message: '∞ operating runway at current ACP income',
});
assert.deepEqual(describeRunway(-1, 25, 0), {
  kind: 'empty',
  message: 'Enter values → runway',
});

console.log('runway: 4 cases passed');
