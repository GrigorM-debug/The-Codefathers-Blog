import { roomConstants } from "../validationConstants/room.js";
import { body } from "express-validator";

export const roomValidations = [
  body("room")
    .trim()
    .notEmpty()
    .withMessage(roomConstants.name.requiredErrorMessage)
    .isLength({
      min: roomConstants.name.minLenght,
      max: roomConstants.name.maxLenght,
    })
    .withMessage(roomConstants.name.lengthErrorMessage),
];
