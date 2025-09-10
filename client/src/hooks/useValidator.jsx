import { useState } from 'react';
import { createValidators } from '../storage/helpers';

export default function useValidator() {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validators = createValidators();

  const validate = (fieldName, value, rules) => {
    for (let rule of rules) {
      const error = rule(value);
      if (error) {
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
        return false;
      }
    }
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
    return true;
  };

  const validateField = (fieldName, value, rules) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    return validate(fieldName, value, rules);
  };

  const validateAll = (formData, validationRules) => {
    let isValid = true;
    const newErrors = {};
    const newTouched = {};

    Object.keys(validationRules).forEach((fieldName) => {
      newTouched[fieldName] = true;
      const rules = validationRules[fieldName];
      const value = formData[fieldName];

      for (let rule of rules) {
        const error = rule(value);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
          break;
        }
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  };

  const clearErrors = () => {
    setErrors({});
    setTouched({});
  };

  return {
    errors,
    touched,
    validators,
    validateField,
    validateAll,
    clearErrors,
  };
}
