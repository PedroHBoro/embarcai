import { Request, Response, Router } from "express";
import prisma from "../../prisma.client";
import { Prisma } from "../../generated/prisma/client";
import bcrypt from "bcryptjs";

export const usuariosRoutes = Router()

const ONZE_DIGITOS = /^\d{11}$/;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

usuariosRoutes.get("/:userId", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        res.status(400).json({ error: "ID do usuário inválido." });
        return;
    }

    try {
        const user = await prisma.usuario.findUnique({
            select: {
                id: true,
                nome: true,
                cpf: true,
                email: true,
                telefone: true,
            },
            where: { id: userId },
        });
    
        if (!user) {
            res.status(404).json({ error: "Usuário não encontrado." });
            return;
        }
    
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar usuário." });
    }
})

usuariosRoutes.put("/:userId", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        res.status(400).json({ error: "ID do usuário inválido." });
        return;
    }

    const { nome, email, telefone } = req.body;

    if (typeof nome !== "string" || nome.trim().length === 0) {
        res.status(400).json({ error: "Nome inválido." });
        return;
    }

    if (typeof email !== "string" || !EMAIL_VALIDO.test(email)) {
        res.status(400).json({ error: "Email inválido." });
        return;
    }

    if (typeof telefone !== "string" || !ONZE_DIGITOS.test(telefone)) {
        res.status(400).json({ error: "Telefone inválido." });
        return;
    }

    try {
        const user = await prisma.usuario.update({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
            },
            where: { id: userId },
            data: {
                nome: nome.trim(),
                email: email.trim(),
                telefone: telefone.trim(),
            },
        });
    
        res.json(user);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                res.status(404).json({ error: "Usuário não encontrado." });
                return;
            }
        }

        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar usuário." });
        return;
    }
})

usuariosRoutes.patch("/:userId/senha", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        res.status(400).json({ error: "ID do usuário inválido." });
        return;
    }

    const { senha, novaSenha } = req.body;

    if (typeof senha !== "string" || senha.trim().length === 0 || typeof novaSenha !== "string" || novaSenha.trim().length === 0) {
        res.status(400).json({ error: "Senha inválida." });
        return;
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
    });

    if (!user) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
    }

    try {
        const senhaConfere = await bcrypt.compare(senha.trim(), user.senha);
        if (!senhaConfere) {
            res.status(400).json({ error: "Senha incorreta." });
            return;
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha.trim(), 10);

        await prisma.usuario.update({
            where: { id: userId },
            data: {
                senha: novaSenhaHash,
            },
        });

        res.status(200).json({ message: "Senha atualizada com sucesso." });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                res.status(404).json({ error: "Usuário não encontrado." });
                return;
            }
        }

        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar senha." });
    }
})