import * as jwt from "jsonwebtoken"

/*
JWT token secret to sign and validate
*/
const JWT_SECRET = process.env.JWT_SECRET || ""
if (!JWT_SECRET) {
    throw Error("JWT_SECRET env var not set.")
}

/*
JWT token time to stale, in seconds
*/
const JWT_TTS = Number(process.env.JWT_TTS || "")
if (!JWT_TTS) {
    throw Error("JWT_TTS env var not set.")
}

export const sign = (payload: Record<string, any>) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTS })
}

export const verify = (token: string) => {
    return jwt.verify(token, JWT_SECRET)
}