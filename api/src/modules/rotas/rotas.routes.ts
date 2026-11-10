import { Router } from "express";
import prisma from "../../prisma.client";

const TIPOS_DIA = ["DIA_UTIL", "SABADO", "DOMINGO"] as const;

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
        itinerarios: {
          orderBy: [{ tipoDia: "asc" }, { ordem: "asc" }],
          include: { ponto: true },
        },
      },
    });

    if (!rota) {
      res.status(404).json({ erro: "Rota não encontrada." });
      return;
    }

    const pontosUnicos = new Map(
      rota.itinerarios.map(({ ponto }) => [ponto.id, ponto])
    );
    res.json([...pontosUnicos.values()]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar pontos." });
  }
});

rotasRoutes.get("/:rotaId/itinerario", async (req, res) => {
  const rotaId = Number(req.params.rotaId);
  const tipoDia = req.query.tipoDia ?? "DIA_UTIL";

  if (!Number.isInteger(rotaId) || rotaId <= 0) {
    res.status(400).json({ erro: "ID da rota inválido." });
    return;
  }

  if (typeof tipoDia !== "string" || !TIPOS_DIA.includes(tipoDia as (typeof TIPOS_DIA)[number])) {
    res.status(400).json({ erro: "Tipo de dia inválido. Use DIA_UTIL, SABADO ou DOMINGO." });
    return;
  }

  try {
    const rota = await prisma.rota.findUnique({
      where: { id: rotaId },
      include: {
        itinerarios: {
          where: { tipoDia: tipoDia as (typeof TIPOS_DIA)[number] },
          orderBy: { ordem: "asc" },
          include: { ponto: true },
        },
      },
    });

    if (!rota) {
      res.status(404).json({ erro: "Rota não encontrada." });
      return;
    }

    res.json(
      rota.itinerarios.map(({ ordem, horario, ponto }) => ({
        id: ponto.id,
        nome: ponto.nome,
        latitude: ponto.latitude,
        longitude: ponto.longitude,
        ordem,
        horario,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar itinerário." });
  }
});
