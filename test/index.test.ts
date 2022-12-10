import { expect, test } from 'vitest';

import { zoxy } from '../source/index.js';
import { userSchema } from './fixtures.js';

test('zoxy', () => {
  const userData = {
    username: 'nyan',
    skills: { foo: 42, bar: { value: 42 } },
  };

  const userProxy = zoxy(userSchema, userData);

  userProxy.username = 'life';
  userProxy.skills.foo = 142;
  userProxy.email = undefined;

  expect(userProxy).toStrictEqual({
    username: 'life',
    skills: { foo: 142, bar: { value: 42 } },
    email: undefined,
  });

  expect(() => {
    userProxy.username = 'cat';
  }).toThrow('String must contain at least 4 character(s)');

  expect(() => {
    userProxy.skills.foo = 0;
  }).toThrow('Number must be greater than or equal to 1');

  expect(() => {
    userProxy.skills.bar.value = 40;
  }).toThrow('Number must be greater than or equal to 42');

  expect(() => {
    // @ts-expect-error ...
    userProxy.email = true;
  }).toThrow('Expected string, received boolean');

  // ---

  expect(() => {
    userProxy.$foo({}).$bar({}).$baz('bazbaz');
  }).toThrow('String must contain at most 3 character(s)');

  const baz = userProxy.$foo({}).$bar({}).$baz('baz');

  expect(baz).toBe('baz');

  expect(userProxy).toStrictEqual({
    username: 'life',
    skills: { foo: 142, bar: { value: 42 } },
    email: undefined,
    foo: { bar: { baz: 'baz' } },
  });

  // ---

  userProxy.$foo({}).$bar({}).baz = 'biz';

  expect(userProxy.foo?.bar?.baz).toBe('biz');

  expect(userProxy).toStrictEqual({
    username: 'life',
    skills: { foo: 142, bar: { value: 42 } },
    email: undefined,
    foo: { bar: { baz: 'biz' } },
  });

  expect(() => {
    userProxy.$foo({}).$bar({}).baz = 'bazbaz';
  }).toThrow('String must contain at most 3 character(s)');
});
