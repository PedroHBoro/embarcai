import { Router } from "express";
import prisma from "../../prisma.client";

export const cartoesRoutes = Router();

const FORMATO_NUMERO_CARTAO = /^\d{8,10}$/;

cartoesRoutes.get("/", async (req, res) => {
  const perfilIdParam = req.query.perfilId;
  const perfilId =
    perfilIdParam !== undefined ? Number(perfilIdParam) : undefined;

  if (
    perfilId !== undefined &&
    (!Number.isInteger(perfilId) || perfilId <= 0)
  ) {
    res.status(400).json({ erro: "ID do perfil inválido." });
    return;
  }

  try {
    const cartoes = await prisma.cartao.findMany({
      where: perfilId !== undefined ? { perfilId } : undefined,
      orderBy: { id: "asc" },
    });

    res.json(cartoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar cartões." });
  }
});

cartoesRoutes.get("/:cartaoId", async (req, res) => {
  const cartaoId = Number(req.params.cartaoId);

  if (!Number.isInteger(cartaoId) || cartaoId <= 0) {
    res.status(400).json({ erro: "ID do cartão inválido." });
    return;
  }

  try {
    const cartao = await prisma.cartao.findUnique({
      where: { id: cartaoId },
    });

    if (!cartao) {
      res.status(404).json({ erro: "Cartão não encontrado." });
      return;
    }

    res.json(cartao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar cartão." });
  }
});

cartoesRoutes.get("/:cartaoId/saldo", async (req, res) => {
  const cartaoId = Number(req.params.cartaoId);

  if (!Number.isInteger(cartaoId) || cartaoId <= 0) {
    res.status(400).json({ erro: "ID do cartão inválido." });
    return;
  }

  try {
    const cartao = await prisma.cartao.findUnique({
      where: { id: cartaoId },
      select: {
        id: true,
        nome: true,
        numeroTccc: true,
        saldo: true,
        tipoPasse: true,
      },
    });

    if (!cartao) {
      res.status(404).json({ erro: "Cartão não encontrado." });
      return;
    }

    res.json(cartao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar saldo do cartão." });
  }
});

cartoesRoutes.post("/", async (req, res) => {
  const {
    nome,
    numeroTccc,
    saldo,
    perfilId,
    tipoPasse,
    instituicaoEnsino,
    comprovanteResidencia,
  } = req.body;

  if (!nome || typeof nome !== "string" || !nome.trim()) {
    res.status(400).json({ erro: "O apelido/nome do cartão é obrigatório." });
    return;
  }

  if (!numeroTccc || typeof numeroTccc !== "string" || !numeroTccc.trim()) {
    res.status(400).json({ erro: "O número do cartão é obrigatório." });
    return;
  }

  const numeroLimpo = numeroTccc.replace(/\s+/g, "");
  if (!FORMATO_NUMERO_CARTAO.test(numeroLimpo)) {
    res.status(400).json({
      erro: "Formato de número inválido. Informe apenas números (entre 8 e 10 dígitos).",
    });
    return;
  }

  if (tipoPasse !== "NORMAL" && tipoPasse !== "ESTUDANTE") {
    res.status(400).json({
      erro: "Selecione o tipo do cartão (Comum ou Estudante).",
    });
    return;
  }

  if (
    tipoPasse === "ESTUDANTE" &&
    (!instituicaoEnsino?.trim() || !comprovanteResidencia?.trim())
  ) {
    res.status(400).json({
      erro: "Instituição de ensino e comprovante de residência são obrigatórios para passe estudantil.",
    });
    return;
  }

  try {
    const novoCartao = await prisma.cartao.create({
      data: {
        nome: nome.trim(),
        numeroTccc: numeroLimpo,
        saldo: typeof saldo === "number" && !Number.isNaN(saldo) ? saldo : 0,
        perfilId:
          typeof perfilId === "number" && Number.isInteger(perfilId)
            ? perfilId
            : null,
        tipoPasse,
        instituicaoEnsino:
          tipoPasse === "ESTUDANTE" ? instituicaoEnsino.trim() : null,
        comprovanteResidencia:
          tipoPasse === "ESTUDANTE" ? comprovanteResidencia.trim() : null,
      },
    });

    res.status(201).json(novoCartao);
  } catch (error: any) {
    console.error(error);
    if (error?.code === "P2002") {
      res
        .status(409)
        .json({ erro: "Já existe um cartão cadastrado com este número." });
      return;
    }
    res.status(500).json({ erro: "Erro ao cadastrar cartão." });
  }
});

cartoesRoutes.put("/:cartaoId", async (req, res) => {
  const cartaoId = Number(req.params.cartaoId);

  if (!Number.isInteger(cartaoId) || cartaoId <= 0) {
    res.status(400).json({ erro: "ID do cartão inválido." });
    return;
  }

  const {
    nome,
    numeroTccc,
    tipoPasse,
    instituicaoEnsino,
    comprovanteResidencia,
    perfilId,
  } = req.body;

  if (!nome || typeof nome !== "string" || !nome.trim()) {
    res.status(400).json({ erro: "O apelido/nome do cartão é obrigatório." });
    return;
  }

  if (!numeroTccc || typeof numeroTccc !== "string" || !numeroTccc.trim()) {
    res.status(400).json({ erro: "O número do cartão é obrigatório." });
    return;
  }

  const numeroLimpo = numeroTccc.replace(/\s+/g, "");
  if (!FORMATO_NUMERO_CARTAO.test(numeroLimpo)) {
    res.status(400).json({
      erro: "Formato de número inválido. Informe apenas números (entre 8 e 10 dígitos).",
    });
    return;
  }

  if (tipoPasse !== "NORMAL" && tipoPasse !== "ESTUDANTE") {
    res.status(400).json({
      erro: "Selecione o tipo do cartão (Comum ou Estudante).",
    });
    return;
  }

  if (
    tipoPasse === "ESTUDANTE" &&
    (!instituicaoEnsino?.trim() || !comprovanteResidencia?.trim())
  ) {
    res.status(400).json({
      erro: "Instituição de ensino e comprovante de residência são obrigatórios para passe estudantil.",
    });
    return;
  }

  try {
    const cartaoAtualizado = await prisma.cartao.update({
      where: { id: cartaoId },
      data: {
        nome: nome.trim(),
        numeroTccc: numeroLimpo,
        tipoPasse,
        instituicaoEnsino:
          tipoPasse === "ESTUDANTE" ? instituicaoEnsino.trim() : null,
        comprovanteResidencia:
          tipoPasse === "ESTUDANTE" ? comprovanteResidencia.trim() : null,
        ...(perfilId !== undefined ? { perfilId } : {}),
      },
    });

    res.json(cartaoAtualizado);
  } catch (error: any) {
    console.error(error);
    if (error?.code === "P2025") {
      res.status(404).json({ erro: "Cartão não encontrado." });
      return;
    }
    if (error?.code === "P2002") {
      res
        .status(409)
        .json({ erro: "Já existe um cartão cadastrado com este número." });
      return;
    }
    res.status(500).json({ erro: "Erro ao atualizar cartão." });
  }
});

cartoesRoutes.delete("/:cartaoId", async (req, res) => {
  const cartaoId = Number(req.params.cartaoId);

  if (!Number.isInteger(cartaoId) || cartaoId <= 0) {
    res.status(400).json({ erro: "ID do cartão inválido." });
    return;
  }

  try {
    await prisma.cartao.delete({
      where: { id: cartaoId },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error(error);
    if (error?.code === "P2025") {
      res.status(404).json({ erro: "Cartão não encontrado." });
      return;
    }
    res.status(500).json({ erro: "Erro ao remover cartão." });
  }
});
