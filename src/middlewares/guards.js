export function isAuthenticated() {
  return (req, res, next) => {
    if (!req.isAuthenticated) {
      return res.redirect("/login");
    }
    next();
  };
}

export function isGuest() {
  return (req, res, next) => {
    if (req.isAuthenticated) {
      return res.redirect("/");
    }
    next();
  };
}
