import { expect, test } from 'vitest';

import { api } from '../source/index.js';

test('The Ultimate Question of Life', () => {
  expect(api.life).toBe(42);
});
