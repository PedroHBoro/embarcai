import express, { Router } from "express";
import {
  ErroRecarga,
  construirEventoStripe,
  processarEventoStripe,
} from "../recargas/recarga.service";

export const webhookRoutes = Router();

webhookRoutes.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const assinatura = req.headers["stripe-signature"];
    const segredo = process.env.STRIPE_WEBHOOK_SECRET;

    if (!segredo || typeof assinatura !== "string") {
      res.status(400).json({ erro: "Webhook da Stripe não configurado." });
      return;
    }

    try {
      const event = construirEventoStripe(req.body, assinatura, segredo);
      await processarEventoStripe(event);
      res.json({ recebido: true });
    } catch (error) {
      if (error instanceof ErroRecarga) {
        res.status(error.status).json({ erro: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ erro: "Erro ao processar webhook." });
    }
  },
);
