import { Router } from "express";
import prisma from "../../prisma.client";

export const instituicoesEnsinoRoutes = Router();

instituicoesEnsinoRoutes.get("/", async (_req, res) => {
  try {
    const instituicoes = await prisma.instituicaoEnsino.findMany({
      orderBy: { nome: "asc" },
      include: { municipio: true },
    });

    res.json(instituicoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar instituições de ensino." });
  }
});
