import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { healthRoutes } from "./health/health.routes";
import { linhasRoutes } from "./linhas/linhas.routes";
import { rotasRoutes } from "./rotas/rotas.routes";
import { cartoesRoutes } from "./cartoes/cartoes.routes";
import { authRoutes } from "./auth/auth.routes";

const publicas = Router();
publicas.use("/health", healthRoutes);
publicas.use("/auth", authRoutes);

const autenticadas = Router();
autenticadas.use(authMiddleware);
autenticadas.use("/linhas", linhasRoutes);
autenticadas.use("/rotas", rotasRoutes);
autenticadas.use("/cartoes", cartoesRoutes);

export const routes = Router();
routes.use(publicas);
routes.use(autenticadas);
