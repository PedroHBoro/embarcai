import { Router } from "express";
import { ErroRecarga, buscarRecargaDoPerfil } from "./recarga.service";

export const recargasRetornoRoutes = Router();
export const recargasRoutes = Router();

function obterPerfilId(sub: unknown): number | null {
  const perfilId = Number(sub);
  return Number.isInteger(perfilId) && perfilId > 0 ? perfilId : null;
}

recargasRetornoRoutes.get("/retorno", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Volte ao aplicativo</title>
</head>
<body>
  <main>
    <h1>Volte ao aplicativo</h1>
    <p>Feche esta página. O saldo será atualizado no aplicativo quando a confirmação chegar.</p>
  </main>
</body>
</html>`);
});

recargasRoutes.get("/:recargaId", async (req, res) => {
  const perfilId = obterPerfilId(req.user?.sub);
  const recargaId = Number(req.params.recargaId);

  if (perfilId === null) {
    res.status(401).json({ erro: "Sessão inválida." });
    return;
  }

  if (!Number.isInteger(recargaId) || recargaId <= 0) {
    res.status(400).json({ erro: "ID da recarga inválido." });
    return;
  }

  try {
    const recarga = await buscarRecargaDoPerfil(perfilId, recargaId);
    res.json(recarga);
  } catch (error) {
    if (error instanceof ErroRecarga) {
      res.status(error.status).json({ erro: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar recarga." });
  }
});
