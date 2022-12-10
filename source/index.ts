import { type AnyZodObject, type TypeOf, type ZodType, type ZodTypeDef, ZodObject } from 'zod';

export type Zody<Schema extends AnyZodObject> = TypeOf<Schema>;

export function zody<Schema extends AnyZodObject, Data extends TypeOf<Schema>>(
  schema: Schema,
  data: Data,
): Zody<Schema> {
  schema.parse(data);

  const shape = schema.shape as Record<PropertyKey, ZodType<unknown, ZodTypeDef, unknown>>;

  return new Proxy<Data>(data, {
    set(target, property, value) {
      return Reflect.set(target, property, shape[property as keyof Data].parse(value));
    },
    get(target, property) {
      const currentValue = Reflect.get(target, property) as unknown;

      if (currentValue && typeof currentValue === 'object') {
        const anyZodObject = shape[property] as AnyZodObject | undefined;

        if (anyZodObject instanceof ZodObject) {
          return zody(anyZodObject, currentValue);
        }
      }

      return currentValue;
    },
  }) as unknown as Zody<Schema>;
}
