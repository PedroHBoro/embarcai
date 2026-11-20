import prisma from "../../prisma.client";

export class ErroViagem extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function registrarViagemAleatoria(perfilId: number, cartaoId: number) {
  return prisma.$transaction(async (tx) => {
    const cartao = await tx.cartao.findFirst({
      where: { id: cartaoId, perfilId },
    });
    if (!cartao) {
      throw new ErroViagem("Cartão não encontrado para este perfil.", 404);
    }

    const itinerarios = await tx.itinerario.findMany({
      include: {
        ponto: true,
        rota: { include: { linha: { include: { municipio: true } } } },
      },
    });

    // Uma combinação ponto/rota só entra uma vez, mesmo quando aparece em
    // vários dias e horários do itinerário.
    const pontoRotasUnicos = new Map<string, (typeof itinerarios)[number]>();
    for (const itinerario of itinerarios) {
      const chave = `${itinerario.rotaId}:${itinerario.pontoId}`;
      if (!pontoRotasUnicos.has(chave)) pontoRotasUnicos.set(chave, itinerario);
    }

    const tipoDesconto = cartao.tipoPasse === "ESTUDANTE"
      ? cartao.tipoDescontoEstudante
      : null;
    const fatorDesconto = tipoDesconto === "TOTAL"
      ? 0
      : tipoDesconto === "PARCIAL" ? 0.5 : 1;
    const opcoes = [...pontoRotasUnicos.values()]
      .map((pontoRota) => ({
        pontoRota,
        valorLinha: pontoRota.rota.linha.municipio?.valor,
      }))
      .filter(({ valorLinha }) =>
        typeof valorLinha === "number" && Number.isFinite(valorLinha) && valorLinha >= 0
      )
      .map((opcao) => ({
        ...opcao,
        saldoGasto: Math.round(opcao.valorLinha! * fatorDesconto * 100) / 100,
      }));

    if (opcoes.length === 0) {
      throw new ErroViagem(
        "Não há ponto/linha elegível com tarifa configurada para este cartão.",
        409
      );
    }

    const sorteado = opcoes[Math.floor(Math.random() * opcoes.length)];
    const { pontoRota, saldoGasto } = sorteado;

    if (saldoGasto > 0) {
      await tx.cartao.update({
        where: { id: cartao.id },
        data: { saldo: { decrement: saldoGasto } },
      });
    }

    return tx.viagem.create({
      data: {
        perfilId,
        cartaoId: cartao.id,
        pontoRotaId: pontoRota.id,
        saldoGasto,
        tipoDesconto,
      },
      include: {
        cartao: {
          select: {
            id: true,
            nome: true,
            numeroTccc: true,
            saldo: true,
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
  });
}
