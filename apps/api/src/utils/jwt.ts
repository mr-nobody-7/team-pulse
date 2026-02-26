import jwt from "jsonwebtoken";


export const generateToken = (payload: object) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
  return token;
}

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
};
