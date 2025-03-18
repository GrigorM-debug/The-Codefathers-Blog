import { model, Schema, SchemaTypes } from "mongoose";
import { userValidationConstants } from "../validationConstants/user.js";

const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
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
    trim: true,
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
  },
  description: {
    type: String,
    default: "",
    required: [true, userValidationConstants.description.requiredErrorMessage],
    minlength: [
      userValidationConstants.description.minLength,
      userValidationConstants.description.lengthErrorMessage,
    ],
    maxlength: [
      userValidationConstants.description.maxLength,
      userValidationConstants.description.lengthErrorMessage,
    ],
  },
  registeredDate: {
    type: Date,
    default: Date.now,
  },
  socketId: { type: String },
});

const User = model("User", userSchema);

export default User;
