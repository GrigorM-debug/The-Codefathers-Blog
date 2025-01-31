export const contactValidationConstants = {
  userName: {
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
  subject: {
    minLength: 10,
    maxLength: 100,
    requiredErrorMessage: "Subject is required !",
    lengthErrorMessage: "Subject must be between 10 and 100 characters long !",
  },
  message: {
    minLength: 20,
    maxLength: 2000,
    requiredErrorMessage: "Message is required !",
    lengthErrorMessage: "Message must be between 20 and 2000 characters long !",
  },
};
