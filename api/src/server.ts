import express, { type Express } from "express";
import dotenv from 'dotenv'
import { routes } from "./modules";

dotenv.config()
const server: Express = express();

server.use(express.json())
server.use(routes)

const PORT = process.env.PORT
server.listen(PORT, () => {
    console.log(`API listening at http://127.0.0.1:${PORT}`)
});