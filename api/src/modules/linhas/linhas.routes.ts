import { Router } from "express";
import prisma from "../../prisma.client";

export const linhasRoutes = Router();

linhasRoutes.get("/", async (_req, res) => {
  try {
    const linhas = await prisma.linha.findMany({
      orderBy: { id: "asc" },
    });

    res.json(linhas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar linhas." });
  }
});

linhasRoutes.get("/:linhaId/rotas", async (req, res) => {
  const linhaId = Number(req.params.linhaId);

  if (!Number.isInteger(linhaId) || linhaId <= 0) {
    res.status(400).json({ erro: "ID da linha inválido." });
    return;
  }

  try {
    const linha = await prisma.linha.findUnique({
      where: { id: linhaId },
      include: {
        rotas: { orderBy: { id: "asc" } },
      },
    });

    if (!linha) {
      res.status(404).json({ erro: "Linha não encontrada." });
      return;
    }

    res.json(linha.rotas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar rotas." });
  }
});