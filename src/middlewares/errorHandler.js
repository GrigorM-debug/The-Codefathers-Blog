export default function errorHandler() {
  return (err, req, res, next) => {
    console.error(err.stack);

    const environment = process.env.ENVIRONMENT;
    console.log(err.message);

    if (environment === "development") {
      res.render("/error_pages/dev_error_page", { err });
    } else if (environment === "production") {
      res.render("/error_pages/500");
    }
  };
}
