import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { healthRoutes } from "./health/health.routes";
import { linhasRoutes } from "./linhas/linhas.routes";
import { rotasRoutes } from "./rotas/rotas.routes";
import { cartoesRoutes } from "./cartoes/cartoes.routes";
import { authRoutes } from "./auth/auth.routes";
import { instituicoesEnsinoRoutes } from "./instituicoes-ensino/instituicoes-ensino.routes";
import { viagensRoutes } from "./viagens/viagens.routes";
import { usuariosRoutes } from "./usuarios/usuarios.routes";

const publicas = Router();
publicas.use("/health", healthRoutes);
publicas.use("/auth", authRoutes);

const autenticadas = Router();
autenticadas.use(authMiddleware);
autenticadas.use("/linhas", linhasRoutes);
autenticadas.use("/rotas", rotasRoutes);
autenticadas.use("/cartoes", cartoesRoutes);
autenticadas.use("/instituicoes-ensino", instituicoesEnsinoRoutes);
autenticadas.use("/viagens", viagensRoutes);
autenticadas.use("/usuarios", usuariosRoutes);

export const routes = Router();
routes.use(publicas);
routes.use(autenticadas);
