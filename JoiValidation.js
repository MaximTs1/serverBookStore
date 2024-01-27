const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } }),
  password: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!/[a-z]/.test(value)) {
        return helpers.error("string.pattern.lowercase");
      }
      if (!/[A-Z]/.test(value)) {
        return helpers.error("string.pattern.uppercase");
      }
      if (!/\d/.test(value)) {
        return helpers.error("string.pattern.digit");
      }
      if (!/[!@%$#^&*_()*]/.test(value)) {
        return helpers.error("string.pattern.specialCharacter");
      }
      return value;
    })
    .min(8)
    .max(20)
    .messages({
      "string.min":
        "Password should have a minimum length of {#limit} characters",
      "string.max":
        "Password should have a maximum length of {#limit} characters",
      "string.pattern.lowercase": "Password should contain a lowercase letter",
      "string.pattern.uppercase": "Password should contain an uppercase letter",
      "string.pattern.digit": "Password should contain a digit",
      "string.pattern.specialCharacter":
        "Password should contain a special character ($, @, $, !, #)",
    }),
});

const signupSchema = Joi.object({
  firstName: Joi.string().min(3).max(10).required(),
  lastName: Joi.string().min(3).max(10).required(),
  email: Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
  password: Joi.string()
    .required()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d{4})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,30}$/
    )
    .message(
      'user "password" must be at least nine characters long and contain an uppercase letter, a lowercase letter, 4 numbers and one of the following characters !@#$%^&*'
    ),
  devName: Joi.string().min(3).required(),
});

module.exports = {
  loginSchema,
  signupSchema,
};
