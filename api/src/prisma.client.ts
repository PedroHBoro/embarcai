import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"
import "dotenv/config";

console.log("DATABASE_URL definida:", !!process.env.DATABASE_URL);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({ adapter })

export default prisma