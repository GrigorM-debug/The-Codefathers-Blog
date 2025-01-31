import { body } from "express-validator";
import { contactValidationConstants } from "../validationConstants/contact.js";

export const contactValidator = [
  body("user_name")
    .trim()
    .notEmpty()
    .withMessage(contactValidationConstants.userName.requiredErrorMessage)
    .isLength({
      min: contactValidationConstants.userName.minLength,
      max: contactValidationConstants.userName.maxLength,
    })
    .withMessage(contactValidationConstants.userName.lengthErrorMessage),
  body("user_email")
    .trim()
    .notEmpty()
    .withMessage(contactValidationConstants.email.requiredErrorMessage)
    .isEmail()
    .withMessage(contactValidationConstants.email.emailErrorMessage)
    .matches(contactValidationConstants.email.emailRegex)
    .withMessage(contactValidationConstants.email.emailErrorMessage)
    .isLength({
      min: contactValidationConstants.email.minLength,
      max: contactValidationConstants.email.maxLength,
    })
    .withMessage(contactValidationConstants.email.lengthErrorMessage),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage(contactValidationConstants.subject.requiredErrorMessage)
    .isLength({
      min: contactValidationConstants.subject.minLength,
      max: contactValidationConstants.subject.maxLength,
    })
    .withMessage(contactValidationConstants.subject.lengthErrorMessage),
  body("message")
    .trim()
    .notEmpty()
    .withMessage(contactValidationConstants.message.requiredErrorMessage)
    .isLength({
      min: contactValidationConstants.message.minLength,
      max: contactValidationConstants.message.maxLength,
    })
    .withMessage(contactValidationConstants.message.lengthErrorMessage),
];
