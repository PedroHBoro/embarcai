import { Request, Response, Router } from "express";
import { healthRoutes } from "./health/health.routes";

export const routes = Router()

routes.use("/health", healthRoutes)