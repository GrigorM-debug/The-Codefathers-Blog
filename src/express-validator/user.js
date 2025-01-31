import { body } from "express-validator";
import { userValidationConstants } from "../validationConstants/user.js";

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(userValidationConstants.username.requiredErrorMessage)
    .isLength({
      min: userValidationConstants.username.minLength,
      max: userValidationConstants.username.maxLength,
    })
    .withMessage(userValidationConstants.username.lengthErrorMessage),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(userValidationConstants.email.requiredErrorMessage)
    .isEmail()
    .withMessage(userValidationConstants.email.emailErrorMessage)
    .matches(userValidationConstants.email.emailRegex)
    .withMessage(userValidationConstants.email.emailErrorMessage),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(userValidationConstants.password.requiredErrorMessage)
    .isLength({
      min: userValidationConstants.password.minLength,
      max: userValidationConstants.password.maxLength,
    })
    .withMessage(userValidationConstants.password.lengthErrorMessage),
  body("repeatPassword")
    .trim()
    .notEmpty()
    .withMessage(userValidationConstants.password.requiredErrorMessage)
    .isLength({
      min: userValidationConstants.password.minLength,
      max: userValidationConstants.password.maxLength,
    })
    .withMessage(userValidationConstants.password.lengthErrorMessage)
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match !"),
  body("imageUrl")
    .trim()
    .notEmpty()
    .withMessage(userValidationConstants.imageUrl.requiredErrorMessage)
    .isLength({
      min: userValidationConstants.imageUrl.minLength,
      max: userValidationConstants.imageUrl.maxLength,
    })
    .withMessage(userValidationConstants.imageUrl.lengthErrorMessage),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage(userValidationConstants.email.requiredErrorMessage)
    .isEmail()
    .withMessage(userValidationConstants.email.emailErrorMessage)
    .matches(userValidationConstants.email.emailRegex)
    .withMessage(userValidationConstants.email.emailErrorMessage),
  body("username")
    .trim()
    .notEmpty()
    .withMessage(userValidationConstants.username.requiredErrorMessage)
    .isLength({
      min: userValidationConstants.username.minLength,
      max: userValidationConstants.username.maxLength,
    })
    .withMessage(userValidationConstants.username.lengthErrorMessage),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(userValidationConstants.password.requiredErrorMessage)
    .isLength({
      min: userValidationConstants.password.minLength,
      max: userValidationConstants.password.maxLength,
    })
    .withMessage(userValidationConstants.password.lengthErrorMessage),
];
