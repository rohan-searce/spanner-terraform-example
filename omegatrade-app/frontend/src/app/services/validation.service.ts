export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any): object {
      const config = {
        required: 'Required',
        invalidEmailAddress: 'Invalid email address',
        minlength: `Minimum length ${validatorValue.requiredLength}`
      };
      return config[validatorName];
    }
  
    static emailValidator(control): any {
      // RFC 2822 compliant regex
      if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
        return null;
      } else {
        return { invalidEmailAddress: true };
      }
    }
  
    static passwordValidator(control): any {
      if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
        return null;
      } else {
        return { invalidPassword: true };
      }
    }
  }
  