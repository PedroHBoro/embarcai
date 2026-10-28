import { Router } from "express";
import prisma from "../../prisma.client";

export const rotasRoutes = Router();

rotasRoutes.get("/:rotaId/pontos", async (req, res) => {
  const rotaId = Number(req.params.rotaId);

  if (!Number.isInteger(rotaId) || rotaId <= 0) {
    res.status(400).json({ erro: "ID da rota inválido." });
    return;
  }

  try {
    const rota = await prisma.rota.findUnique({
      where: { id: rotaId },
      include: {
        pontos: { orderBy: { id: "asc" } },
      },
    });

    if (!rota) {
      res.status(404).json({ erro: "Rota não encontrada." });
      return;
    }

    res.json(rota.pontos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar pontos." });
  }
});