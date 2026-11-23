import Stripe from "stripe";
import prisma from "../../prisma.client";

export class ErroRecarga extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

const MINIMO_CENTAVOS = 500;
const MAXIMO_CENTAVOS = 20000;

let clienteStripe: Stripe | null = null;

function obterStripe(): Stripe {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) {
    throw new ErroRecarga("Pagamento não configurado.", 500);
  }
  if (!clienteStripe) {
    clienteStripe = new Stripe(chave);
  }
  return clienteStripe;
}

export function validarValorCentavos(valor: unknown): number | null {
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    return null;
  }
  if (valor < MINIMO_CENTAVOS || valor > MAXIMO_CENTAVOS) {
    return null;
  }
  return valor;
}

function urlPublica(): string {
  const base = process.env.API_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (!base) {
    throw new ErroRecarga("URL pública da API não configurada.", 500);
  }
  return base;
}

function saldoCreditado(valorCentavos: number): number {
  return Number((valorCentavos / 100).toFixed(2));
}

export async function criarRecarga(
  perfilId: number,
  cartaoId: number,
  valorCentavos: number,
) {
  const cartao = await prisma.cartao.findFirst({
    where: { id: cartaoId, perfilId },
  });
  if (!cartao) {
    throw new ErroRecarga("Cartão não encontrado para este perfil.", 404);
  }

  const base = urlPublica();
  const recarga = await prisma.recarga.create({
    data: {
      valorCentavos,
      cartaoId,
      perfilId,
    },
  });

  try {
    const session = await obterStripe().checkout.sessions.create({
      mode: "payment",
      success_url: `${base}/recargas/retorno`,
      cancel_url: `${base}/recargas/retorno`,
      metadata: { recargaId: String(recarga.id) },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: valorCentavos,
            product_data: { name: `Recarga ${cartao.nome}` },
          },
        },
      ],
    });

    if (!session.url) {
      throw new ErroRecarga("Não foi possível iniciar o pagamento.", 502);
    }

    await prisma.recarga.update({
      where: { id: recarga.id },
      data: { stripeSessionId: session.id },
    });

    return { id: recarga.id, url: session.url };
  } catch (error) {
    await prisma.recarga.update({
      where: { id: recarga.id },
      data: { status: "FALHOU" },
    });
    if (error instanceof ErroRecarga) {
      throw error;
    }
    console.error(error);
    throw new ErroRecarga("Não foi possível iniciar o pagamento.", 502);
  }
}

export async function buscarRecargaDoPerfil(perfilId: number, recargaId: number) {
  const recarga = await prisma.recarga.findFirst({
    where: { id: recargaId, perfilId },
    include: {
      cartao: {
        select: { id: true, saldo: true },
      },
    },
  });

  if (!recarga) {
    throw new ErroRecarga("Recarga não encontrada.", 404);
  }

  return {
    id: recarga.id,
    status: recarga.status,
    cartao: recarga.cartao,
  };
}

function idDaRecarga(session: Stripe.Checkout.Session): number | null {
  const recargaId = Number(session.metadata?.recargaId);
  return Number.isInteger(recargaId) && recargaId > 0 ? recargaId : null;
}

async function creditarSessao(session: Stripe.Checkout.Session) {
  const recargaId = idDaRecarga(session);
  if (recargaId === null || session.amount_total == null) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const recarga = await tx.recarga.findUnique({ where: { id: recargaId } });
    if (!recarga || recarga.status !== "PENDENTE") {
      return;
    }

    if (recarga.valorCentavos !== session.amount_total) {
      await tx.recarga.updateMany({
        where: { id: recarga.id, status: "PENDENTE" },
        data: { status: "FALHOU", stripeSessionId: session.id },
      });
      return;
    }

    const atualizada = await tx.recarga.updateMany({
      where: { id: recarga.id, status: "PENDENTE" },
      data: { status: "PAGA", stripeSessionId: session.id },
    });
    if (atualizada.count !== 1) {
      return;
    }

    await tx.cartao.update({
      where: { id: recarga.cartaoId },
      data: { saldo: { increment: saldoCreditado(recarga.valorCentavos) } },
    });
  });
}

export function construirEventoStripe(
  payload: string | Buffer,
  assinatura: string,
  segredo: string,
): Stripe.Event {
  try {
    return obterStripe().webhooks.constructEvent(payload, assinatura, segredo);
  } catch (error) {
    if (error instanceof ErroRecarga) {
      throw error;
    }
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      throw new ErroRecarga("Assinatura inválida.", 400);
    }
    throw error;
  }
}

export async function processarEventoStripe(event: Stripe.Event) {
  if (event.type !== "checkout.session.completed") {
    return;
  }
  if (event.data.object.payment_status !== "paid") {
    return;
  }
  await creditarSessao(event.data.object);
}
