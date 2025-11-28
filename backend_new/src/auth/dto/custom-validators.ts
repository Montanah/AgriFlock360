import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  Validate,
} from 'class-validator';

export function ValidateLoginCredentials(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'validateLoginCredentials',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const email = obj.email;
          const phoneNumber = obj.phone_number;

          // Either email or phone_number must be provided
          if (!email && !phoneNumber) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Either email or phone_number must be provided';
        },
      },
    });
  };
}
