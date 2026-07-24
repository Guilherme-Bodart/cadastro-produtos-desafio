import { Router } from "express";
import { LoginController } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/login", LoginController);

export default authRoutes;
