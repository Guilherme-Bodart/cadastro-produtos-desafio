import { Router } from "express";
import productsRoutes from "./products.routes";
import usersRoutes from "./users.routes";
import authRoutes from "./auth.routes";

const routes = Router();

routes.use("/products", productsRoutes);
routes.use("/users", usersRoutes);
routes.use("/auth", authRoutes);

export default routes;
