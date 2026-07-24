import { Router } from "express";
import {
  CreateUserController,
  UpdateUserController,
} from "../controllers/user.controller";

const usersRoutes = Router();

usersRoutes.post("/", CreateUserController);
usersRoutes.put("/:id", UpdateUserController);

export default usersRoutes;