import { Request, Response, Router } from "express";
import prisma from "../../prisma.client";

export const healthRoutes = Router()

healthRoutes.get("", async (req: Request, res: Response) => {
    prisma.$queryRaw`SELECT 1`

    return res.status(200).json({
        status: "ok",
        database: "ok",
        timestamp: new Date().toISOString()
    })
})