export const postValidationConstants = {
  title: {
    minLength: 3,
    maxLength: 20,
    requiredErrorMessage: "Title is required !",
    lengthErrorMessage: `Title must be between ${minLength} and ${maxLength} characters long !`,
  },
  content: {
    minLength: 200,
    requiredErrorMessage: "Content is required !",
    lengthErrorMessage: `Content must be between ${minLength} and ${maxLength} characters long !`,
  },
  bannerImageUrl: {
    minLength: 3,
    maxLength: 5000,
    requiredErrorMessage: "Banner image URL is required !",
    lengthErrorMessage: `Banner image URL must be between ${minLength} and ${maxLength} characters long !`,
    imageUrlRegex:
      /^https?:\/\/(?:[\w-]+\.)+[\w-]+(?:\/[\w-.\/?%&=]*)?\.(?:jpg|jpeg|png|gif|webp)(?:\?[\w=&]*)?$/i,
    imageUrlErrorMessage: "Banner image URL must be a valid image URL !",
  },
};
