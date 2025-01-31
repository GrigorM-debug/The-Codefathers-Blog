export const userValidationConstants = {
  username: {
    minLength: 3,
    maxLength: 20,
    requiredErrorMessage: "Username is required !",
    lengthErrorMessage: "Username must be between 3 and 20 characters long !",
  },
  email: {
    minLength: 5,
    maxLength: 100,
    lengthErrorMessage: "Email must be between 5 and 100 characters long !",
    requiredErrorMessage: "Email is required !",
    emailRegex:
      /^([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+")@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    emailErrorMessage: "Email must be a valid email address !",
  },
  password: {
    minLength: 8,
    maxLength: 20,
    requiredErrorMessage: "Password is required !",
    lengthErrorMessage: "Password must be between 8 and 20 characters long !",
  },
  imageUrl: {
    minLength: 3,
    maxLength: 5000,
    requiredErrorMessage: "Image URL is required !",
    lengthErrorMessage:
      "Image URL must be between 3 and 5000 characters long !",
    /*imageUrlRegex:
      /(http[s]?:\/\/.*\.(?:png|jpg|gif|svg|jpeg))/i,8*/
    imageUrlErrorMessage: "Image URL must be a valid image URL !",
  },
};
