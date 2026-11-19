import { Request, Router } from "express";
import prisma from "../../prisma.client";

export const viagensRoutes = Router();

function obterPerfilId(req: Request): number | null {
  const sub = Number(req.user?.sub);
  return Number.isInteger(sub) && sub > 0 ? sub : null;
}

viagensRoutes.get("/", async (req, res) => {
  const perfilId = obterPerfilId(req);
  if (perfilId === null) {
    res.status(401).json({ erro: "Sessão inválida." });
    return;
  }

  try {
    const viagens = await prisma.viagem.findMany({
      where: { perfilId },
      orderBy: { criadoEm: "desc" },
      include: {
        cartao: {
          select: {
            id: true,
            nome: true,
            numeroTccc: true,
            tipoPasse: true,
            tipoDescontoEstudante: true,
          },
        },
        pontoRota: {
          include: {
            ponto: true,
            rota: { include: { linha: true } },
          },
        },
      },
    });

    res.json(viagens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar viagens." });
  }
});
