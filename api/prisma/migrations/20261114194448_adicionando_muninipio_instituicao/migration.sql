/*
  Warnings:

  - You are about to drop the column `instituicaoEnsino` on the `Cartao` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoDescontoEstudante" AS ENUM ('TOTAL', 'PARCIAL');

-- AlterTable
ALTER TABLE "Cartao" DROP COLUMN "instituicaoEnsino",
ADD COLUMN     "idInstituicaoEnsino" INTEGER,
ADD COLUMN     "tipoDescontoEstudante" "TipoDescontoEstudante" NOT NULL DEFAULT 'TOTAL';

-- AlterTable
ALTER TABLE "Linha" ADD COLUMN     "municipioId" INTEGER;

-- CreateTable
CREATE TABLE "Municipio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstituicaoEnsino" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "municipioId" INTEGER NOT NULL,

    CONSTRAINT "InstituicaoEnsino_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InstituicaoEnsino" ADD CONSTRAINT "InstituicaoEnsino_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linha" ADD CONSTRAINT "Linha_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartao" ADD CONSTRAINT "Cartao_idInstituicaoEnsino_fkey" FOREIGN KEY ("idInstituicaoEnsino") REFERENCES "InstituicaoEnsino"("id") ON DELETE SET NULL ON UPDATE CASCADE;
