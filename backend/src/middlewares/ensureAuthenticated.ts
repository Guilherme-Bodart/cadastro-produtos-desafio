import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "JWT token não informado." });
  }

  const [, token] = authHeader.split(" ");

  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = verify(token, secret) as TokenPayload;

    req.userId = decoded.sub;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token JWT inválido ou expirado." });
  }
}
