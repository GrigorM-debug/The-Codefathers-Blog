import jwt from "jsonwebtoken";

const secret = "Jwt Secret";

export function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "2d" });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}
