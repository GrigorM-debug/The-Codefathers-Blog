export const commentValidationConstants = {
  content: {
    minLength: 10,
    maxLength: 1000,
    requiredErrorMessage: "Content is required !",
    lengthErrorMessage: `Content must be at least ${minLength} characters long !`,
  },
};
