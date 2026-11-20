import { Request, Response, Router } from "express";
import prisma from "../../prisma.client";
import { Prisma } from "../../generated/prisma/client";

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