import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(4),
  email: z.string().optional(),
  skills: z.object({
    foo: z.number().min(1),
    bar: z.object({
      value: z.number().min(42),
    }),
  }),
  foo: z
    .object({
      bar: z
        .object({
          baz: z.string().max(3).optional(),
        })
        .optional(),
    })
    .optional(),
});
