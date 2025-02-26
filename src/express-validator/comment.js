import { body } from "express-validator";
import { commentValidationConstants } from "../validationConstants/comment.js";
export const commentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage(commentValidationConstants.content.requiredErrorMessage)
    .isLength({
      min: commentValidationConstants.content.minLength,
    })
    .withMessage(commentValidationConstants.content.lengthErrorMessage),
];
