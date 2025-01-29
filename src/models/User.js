import { model, Schema, SchemaTypes } from "mongoose";
import { userValidationConstants } from "../validationConstants/user.js";

const userSchema = new Schema({
  _id: SchemaTypes.ObjectId,
  username: {
    type: String,
    required: [true, userValidationConstants.username.requiredErrorMessage],
    minlength: [
      userValidationConstants.username.minLength,
      userValidationConstants.username.lengthErrorMessage,
    ],
    maxlength: [
      userValidationConstants.username.maxLength,
      userValidationConstants.username.lengthErrorMessage,
    ],
    unique: true,
  },
  email: {
    type: String,
    required: [true, userValidationConstants.email.requiredErrorMessage],
    minlength: [
      userValidationConstants.email.minLength,
      userValidationConstants.email.lengthErrorMessage,
    ],
    maxlength: [
      userValidationConstants.email.maxLength,
      userValidationConstants.email.lengthErrorMessage,
    ],
    match: [
      userValidationConstants.email.emailRegex,
      userValidationConstants.email.emailErrorMessage,
    ],
    unique: true,
  },
  passwordHash: {
    type: String,
    required: [true, userValidationConstants.password.requiredErrorMessage],
    minlength: [
      userValidationConstants.password.minLength,
      userValidationConstants.password.lengthErrorMessage,
    ],
    maxlength: [
      userValidationConstants.password.maxLength,
      userValidationConstants.password.lengthErrorMessage,
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  imageUrl: {
    type: String,
    default: "",
    required: [true, userValidationConstants.imageUrl.requiredErrorMessage],
    minlength: [
      userValidationConstants.imageUrl.minLength,
      userValidationConstants.imageUrl.lengthErrorMessage,
    ],
    maxlength: [
      userValidationConstants.imageUrl.maxLength,
      userValidationConstants.imageUrl.lengthErrorMessage,
    ],
    match: [
      userValidationConstants.imageUrl.imageUrlRegex,
      userValidationConstants.imageUrl.imageUrlErrorMessage,
    ],
  },
});

const User = model("User", userSchema);

export default User;
