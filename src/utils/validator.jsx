import React, { useState } from "react";

export default function useValidator() {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validators = {
    isRequired: (value, message = "Vui lòng nhập trường này") => {
      return value && value.trim() ? undefined : message;
    },

    isEmail: (value, message = "Trường này phải là email") => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(value) ? undefined : message;
    },

    minLength: (value, min, message) => {
      return value && value.length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
    },

    isConfirmed: (
      value,
      confirmValue,
      message = "Mật khẩu xác nhận không khớp",
    ) => {
      return value === confirmValue ? undefined : message;
    },
  };

  const validate = (fieldName, value, rules) => {
    for (let rule of rules) {
      const error = rule(value);
      if (error) {
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
        return false;
      }
    }
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
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
