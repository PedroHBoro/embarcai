import { Request, Router } from "express";
import prisma from "../../prisma.client";
import { ErroRecarga, criarRecarga, validarValorCentavos } from "../recargas/recarga.service";
import { ErroViagem, registrarViagemAleatoria } from "../viagens/viagem.service";

export const cartoesRoutes = Router();

const FORMATO_NUMERO_CARTAO = /^\d{8,10}$/;

function obterPerfilId(req: Request): number | null {
  const sub = Number(req.user?.sub);
  return Number.isInteger(sub) && sub > 0 ? sub : null;
}

cartoesRoutes.get("/", async (req, res) => {
  const perfilId = obterPerfilId(req);

  try {
    const cartoes = await prisma.cartao.findMany({
      where: perfilId !== null ? { perfilId } : undefined,
      orderBy: { id: "asc" },
      include: {
        instituicaoEnsino: { include: { municipio: true } },
      },
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
  const perfilId = obterPerfilId(req) ?? req.body.perfilId ?? null;
  const {
    nome,
    numeroTccc,
    saldo,
    tipoPasse,
    idInstituicaoEnsino,
    comprovanteResidencia,
    tipoDescontoEstudante,
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
    (!Number.isInteger(Number(idInstituicaoEnsino)) ||
      Number(idInstituicaoEnsino) <= 0 ||
      !comprovanteResidencia?.trim() ||
      !["TOTAL", "PARCIAL"].includes(tipoDescontoEstudante))
  ) {
    res.status(400).json({
      erro: "Selecione a instituição, o tipo de desconto e informe o comprovante de residência para passe estudantil.",
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
        tipoDescontoEstudante:
          tipoPasse === "ESTUDANTE" ? tipoDescontoEstudante : "TOTAL",
        idInstituicaoEnsino:
          tipoPasse === "ESTUDANTE" ? Number(idInstituicaoEnsino) : null,
        comprovanteResidencia:
          tipoPasse === "ESTUDANTE" ? comprovanteResidencia.trim() : null,
      },
      include: {
        instituicaoEnsino: { include: { municipio: true } },
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
    idInstituicaoEnsino,
    comprovanteResidencia,
    tipoDescontoEstudante,
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
    (!Number.isInteger(Number(idInstituicaoEnsino)) ||
      Number(idInstituicaoEnsino) <= 0 ||
      !comprovanteResidencia?.trim() ||
      !["TOTAL", "PARCIAL"].includes(tipoDescontoEstudante))
  ) {
    res.status(400).json({
      erro: "Selecione a instituição, o tipo de desconto e informe o comprovante de residência para passe estudantil.",
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
        tipoDescontoEstudante:
          tipoPasse === "ESTUDANTE" ? tipoDescontoEstudante : "TOTAL",
        idInstituicaoEnsino:
          tipoPasse === "ESTUDANTE" ? Number(idInstituicaoEnsino) : null,
        comprovanteResidencia:
          tipoPasse === "ESTUDANTE" ? comprovanteResidencia.trim() : null,
      },
      include: {
        instituicaoEnsino: { include: { municipio: true } },
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

cartoesRoutes.post("/:cartaoId/uso-nfc", async (req, res) => {
  const cartaoId = Number(req.params.cartaoId);
  const perfilId = obterPerfilId(req);

  if (!Number.isInteger(cartaoId) || cartaoId <= 0) {
    res.status(400).json({ erro: "ID do cartão inválido." });
    return;
  }

  if (perfilId === null) {
    res.status(401).json({ erro: "Sessão inválida." });
    return;
  }

  try {
    const viagem = await registrarViagemAleatoria(perfilId, cartaoId);
    res.status(201).json(viagem);
  } catch (error) {
    if (error instanceof ErroViagem) {
      res.status(error.status).json({ erro: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ erro: "Erro ao processar aproximação NFC." });
  }
});

cartoesRoutes.post("/:cartaoId/recargas", async (req, res) => {
  const cartaoId = Number(req.params.cartaoId);
  const perfilId = obterPerfilId(req);
  const valorCentavos = validarValorCentavos(req.body?.valorCentavos);

  if (!Number.isInteger(cartaoId) || cartaoId <= 0) {
    res.status(400).json({ erro: "ID do cartão inválido." });
    return;
  }

  if (perfilId === null) {
    res.status(401).json({ erro: "Sessão inválida." });
    return;
  }

  if (valorCentavos === null) {
    res.status(400).json({
      erro: "Informe um valor entre R$ 5,00 e R$ 200,00.",
    });
    return;
  }

  try {
    const recarga = await criarRecarga(perfilId, cartaoId, valorCentavos);
    res.status(201).json(recarga);
  } catch (error) {
    if (error instanceof ErroRecarga) {
      res.status(error.status).json({ erro: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ erro: "Erro ao solicitar recarga." });
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
