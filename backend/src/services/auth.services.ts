import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import prisma from "../config/database";

interface AuthData {
  email: string;
  password: string;
}

export const AuthenticateService = async (data: AuthData) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("E-mail ou senha incorretos.");
  }

  const passwordMatched = await compare(data.password, user.password);

  if (!passwordMatched) {
    throw new Error("E-mail ou senha incorretos.");
  }

  const secret = process.env.JWT_SECRET || "default_secret";
  const token = sign({}, secret, {
    subject: user.id,
    expiresIn: "1d",
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};
