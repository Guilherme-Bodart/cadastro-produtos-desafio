import { Request, Response } from "express";
import { AuthenticateService } from "../services/auth.services";

export const LoginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "E-mail e senha são obrigatórios." });
    }

    const auth = await AuthenticateService({ email, password });

    return res.json(auth);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Erro ao realizar login." });
  }
};
