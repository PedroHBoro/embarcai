import { Router } from "express";
import { healthRoutes } from "./health/health.routes";
import { linhasRoutes } from "./linhas/linhas.routes";
import { rotasRoutes } from "./rotas/rotas.routes";

export const routes = Router();

routes.use("/health", healthRoutes);
routes.use("/linhas", linhasRoutes);
routes.use("/rotas", rotasRoutes);