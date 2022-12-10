import {
  type AnyZodObject,
  type TypeOf,
  type ZodType,
  type ZodTypeAny,
  type ZodTypeDef,
  ZodObject,
  ZodOptional,
} from 'zod';

type ZodyProxy<Data> = {
  [Key in keyof Data as `$${Key extends string ? Key : never}`]-?: (value: Data[Key]) => Zody<NonNullable<Data[Key]>>;
};

export type Zody<Data> = ZodyProxy<Data> & Data;

export function zody<Schema extends AnyZodObject, Data extends TypeOf<Schema>>(
  schema: Schema,
  data: Data,
): Zody<TypeOf<Schema>> {
  schema.parse(data);

  const shape = schema.shape as Record<PropertyKey, ZodType<unknown, ZodTypeDef, unknown>>;

  return new Proxy<Data>(data, {
    set(target, property, value) {
      return Reflect.set(target, property, shape[property as keyof Data].parse(value));
    },
    get(target, property) {
      if (typeof property === 'string' && property.startsWith('$')) {
        const subProperty = property.slice(1);
        let anyZodType = shape[subProperty];

        if (anyZodType instanceof ZodOptional) {
          anyZodType = anyZodType.unwrap() as ZodTypeAny;
        }

        if (!anyZodType) {
          throw new Error(`There is no zod schema found for the property '${subProperty}'.`);
        }

        return (defaultValue: unknown) => {
          const currentValue = Reflect.get(target, subProperty) as unknown;

          if (currentValue === undefined) {
            Reflect.set(target, subProperty, anyZodType?.parse(defaultValue));
          }

          const value = Reflect.get(target, subProperty) as unknown;

          if (anyZodType instanceof ZodObject && value && typeof value === 'object') {
            return zody(anyZodType, value) as Zody<AnyZodObject>;
          }

          return value;
        };
      }

      const currentValue = Reflect.get(target, property) as unknown;

      if (currentValue && typeof currentValue === 'object') {
        const anyZodObject = shape[property] as AnyZodObject | undefined;

        if (anyZodObject instanceof ZodObject) {
          return zody(anyZodObject, currentValue);
        }
      }

      return currentValue;
    },
  }) as unknown as Zody<TypeOf<Schema>>;
}
