import { expect, test } from 'vitest';
import { z } from 'zod';

import { zody } from '../source/index.js';

const userSchema = z.object({
  username: z.string().min(4),
  email: z.string().optional(),
  skills: z.object({
    foo: z.number().min(1),
    bar: z.object({
      value: z.number().min(42),
    }),
  }),
});

test('zody', () => {
  const userData = { username: 'nyan', skills: { foo: 42, bar: { value: 42 } } };
  const userProxy = zody(userSchema, userData);

  userProxy.username = 'life';
  userProxy.skills.foo = 142;

  expect(() => {
    userProxy.username = 'cat';
  }).toThrow('String must contain at least 4 character(s)');

  expect(() => {
    userProxy.skills.foo = 0;
  }).toThrow('Number must be greater than or equal to 1');

  expect(() => {
    userProxy.skills.bar.value = 40;
  }).toThrow('Number must be greater than or equal to 42');
});
