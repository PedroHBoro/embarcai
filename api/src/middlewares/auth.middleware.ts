import { NextFunction, Request, Response } from "express";
import { verify } from "../utils/jwt.util";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = verify(token);

    if (typeof payload === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
