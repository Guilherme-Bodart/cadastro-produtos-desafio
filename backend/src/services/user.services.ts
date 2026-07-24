import { hash } from "bcryptjs";
import prisma from "../config/database";

interface UserData {
  name: string;
  email: string;
  password: string;
}

export const CreateUserService = async (data: UserData) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("Já existe um usuário cadastrado com este email.");
  }

  const hashedPassword = await hash(data.password, 8);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });
};

export const UpdateUserService = async (id: string, data: UserData) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: data.email,
      NOT: { id },
    },
  });

  if (existingUser) {
    throw new Error("Já existe um usuário cadastrado com este email.");
  }

  const hashedPassword = data.password
    ? await hash(data.password, 8)
    : undefined;

  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      ...(hashedPassword && { password: hashedPassword }),
    },
  });
};
