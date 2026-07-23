import { registerDecorator, type ValidationOptions } from 'class-validator';

// Validates that the value is one of the comma-separated origins in ALLOWED_ORIGINS
export function IsAllowedOrigin(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isAllowedOrigin',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          const allowed = (process.env.ALLOWED_ORIGINS ?? '')
            .split(',')
            .map((origin) => origin.trim())
            .filter((origin) => origin.length > 0);
          return allowed.includes(value);
        },
        defaultMessage(): string {
          return 'The originating application is not allowed.';
        },
      },
    });
  };
}
