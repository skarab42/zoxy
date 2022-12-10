import {
  type AnyZodObject,
  type TypeOf,
  type ZodType,
  type ZodTypeAny,
  type ZodTypeDef,
  ZodObject,
  ZodOptional,
} from 'zod';

type ValidProperty<Data, Property extends keyof Data> = Data[Property] extends NonNullable<Data[Property]>
  ? never
  : Property;

type ZoxyProxy<Data, Prefix extends string> = {
  [Property in keyof Data as `${Prefix}${Property extends string ? ValidProperty<Data, Property> : never}`]-?: (
    value: Data[Property],
  ) => Zoxy<NonNullable<Data[Property]>, Prefix>;
};

export type ZoxyOptions<Prefix extends string> = {
  prefix?: Prefix;
};

export type Zoxy<Data, Prefix extends string> = ZoxyProxy<Data, Prefix> & Data;

export function zoxy<Schema extends AnyZodObject, Data extends TypeOf<Schema>, Prefix extends string = '$'>(
  schema: Schema,
  data: Data,
  options?: ZoxyOptions<Prefix>,
): Zoxy<TypeOf<Schema>, Prefix> {
  schema.parse(data);

  const prefix = options?.prefix ?? '$';
  const shape = schema.shape as Record<PropertyKey, ZodType<unknown, ZodTypeDef, unknown>>;

  return new Proxy<Data>(data, {
    set(target, property, value) {
      return Reflect.set(target, property, shape[property as keyof Data].parse(value));
    },
    /** Prout */
    get(target, property) {
      if (typeof property === 'string' && property.startsWith(prefix)) {
        const subProperty = property.slice(prefix.length);
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
            return zoxy(anyZodType, value, options) as Zoxy<AnyZodObject, Prefix>;
          }

          return value;
        };
      }

      const currentValue = Reflect.get(target, property) as unknown;

      if (currentValue && typeof currentValue === 'object') {
        const anyZodObject = shape[property] as AnyZodObject | undefined;

        if (anyZodObject instanceof ZodObject) {
          return zoxy(anyZodObject, currentValue, options);
        }
      }

      return currentValue;
    },
  }) as unknown as Zoxy<TypeOf<Schema>, Prefix>;
}
