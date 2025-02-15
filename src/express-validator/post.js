import { body } from "express-validator";
import { postValidationConstants } from "../validationConstants/post.js";

export const postValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage(postValidationConstants.title.requiredErrorMessage)
    .isString()
    .isLength({
      min: postValidationConstants.title.minLength,
      max: postValidationConstants.title.maxLength,
    })
    .withMessage(postValidationConstants.title.lengthErrorMessage),
  body("content")
    .trim()
    .notEmpty()
    .withMessage(postValidationConstants.content.requiredErrorMessage)
    .isLength({ min: postValidationConstants.content.minLength })
    .withMessage(postValidationConstants.content.lengthErrorMessage),
  body("bannerImageUrl")
    .trim()
    .notEmpty()
    .isString()
    .withMessage(postValidationConstants.bannerImageUrl.requiredErrorMessage)
    .isLength({
      min: postValidationConstants.bannerImageUrl.minLength,
      max: postValidationConstants.bannerImageUrl.maxLength,
    })
    .withMessage(postValidationConstants.bannerImageUrl.lengthErrorMessage)
    .matches(postValidationConstants.bannerImageUrl.imageUrlRegex)
    .withMessage(postValidationConstants.bannerImageUrl.imageUrlErrorMessage),
];
