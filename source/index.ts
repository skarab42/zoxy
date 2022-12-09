import type { TypeOf, ZodSchema, ZodType, ZodTypeDef } from 'zod';

type DataSchema<Data> = { shape: Record<keyof Data, ZodType<unknown, ZodTypeDef, unknown>> };

export function zody<Schema extends ZodSchema, Data extends TypeOf<Schema>>(
  schema: Schema,
  data: Data,
): TypeOf<Schema> {
  schema.parse(data);

  const { shape } = schema as unknown as DataSchema<Data>;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return new Proxy<Data>(data, {
    set(target: Data, property: keyof Data, value: unknown) {
      return Reflect.set(target, property, shape[property].parse(value));
    },
    get(target: Data, property: keyof Data) {
      const value = Reflect.get(target, property) as unknown;

      if (value !== null && typeof value === 'object') {
        return zody(shape[property], target[property]);
      }

      return value;
    },
  });
}
