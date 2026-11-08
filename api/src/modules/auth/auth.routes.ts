import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../prisma.client";
import { sign } from "../../utils/jwt.util";

export const authRoutes = Router();

const ONZE_DIGITOS = /^\d{11}$/;

function respostaUsuario(usuario: { id: number; nome: string; email: string }) {
  return {
    token: sign({ sub: usuario.id }),
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  };
}

authRoutes.post("/cadastro", async (req, res) => {
  const nome = typeof req.body.nome === "string" ? req.body.nome.trim() : "";
  const cpf = typeof req.body.cpf === "string" ? req.body.cpf : "";
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const telefone = typeof req.body.telefone === "string" ? req.body.telefone : "";
  const senha = typeof req.body.senha === "string" ? req.body.senha : "";

  if (!nome) {
    res.status(400).json({ erro: "O nome é obrigatório." });
    return;
  }

  if (!ONZE_DIGITOS.test(cpf)) {
    res.status(400).json({ erro: "O CPF deve ter exatamente 11 dígitos." });
    return;
  }

  if (!email) {
    res.status(400).json({ erro: "O email é obrigatório." });
    return;
  }

  if (!ONZE_DIGITOS.test(telefone)) {
    res.status(400).json({ erro: "O telefone deve ter exatamente 11 dígitos." });
    return;
  }

  if (senha.length < 8) {
    res.status(400).json({ erro: "A senha deve ter no mínimo 8 caracteres." });
    return;
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, cpf, email, telefone, senha: senhaHash },
    });

    res.status(201).json(respostaUsuario(usuario));
  } catch (error: any) {
    console.error(error);
    if (error?.code === "P2002") {
      const alvo = [
        Array.isArray(error?.meta?.target) ? error.meta.target.join(" ") : error?.meta?.target,
        error?.message,
      ]
        .filter(Boolean)
        .join(" ");

      if (alvo.includes("email")) {
        res.status(409).json({ erro: "Já existe um usuário com este email." });
        return;
      }

      if (alvo.includes("cpf")) {
        res.status(409).json({ erro: "Já existe um usuário com este CPF." });
        return;
      }

      res.status(409).json({ erro: "Já existe um usuário com estes dados." });
      return;
    }

    res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
});

authRoutes.post("/login", async (req, res) => {
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const senha = typeof req.body.senha === "string" ? req.body.senha : "";

  if (!email || senha.length < 8) {
    res.status(401).json({ erro: "Email ou senha inválidos." });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    const senhaConfere =
      usuario !== null && (await bcrypt.compare(senha, usuario.senha));

    if (!usuario || !senhaConfere) {
      res.status(401).json({ erro: "Email ou senha inválidos." });
      return;
    }

    res.json(respostaUsuario(usuario));
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao entrar." });
  }
});
