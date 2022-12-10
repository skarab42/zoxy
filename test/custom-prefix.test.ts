import { expect, test } from 'vitest';

import { zody } from '../source/index.js';
import { userSchema } from './fixtures.js';

test('zody with custom prefix', () => {
  const userData = {
    username: 'nyan',
    skills: { foo: 42, bar: { value: 42 } },
  };

  const userProxy = zody(userSchema, userData, { prefix: '__' });

  const baz = userProxy.__foo({}).__bar({}).__baz('baz');

  expect(baz).toBe('baz');

  expect(userProxy).toStrictEqual({
    username: 'nyan',
    skills: { foo: 42, bar: { value: 42 } },
    foo: { bar: { baz: 'baz' } },
  });
});
