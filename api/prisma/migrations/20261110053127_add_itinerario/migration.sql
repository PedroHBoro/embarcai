/*
  Warnings:

  - You are about to drop the column `rotaId` on the `Ponto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ponto" DROP CONSTRAINT "Ponto_rotaId_fkey";

-- AlterTable
ALTER TABLE "Ponto" DROP COLUMN "rotaId";

-- CreateTable
CREATE TABLE "Itinerario" (
    "id" SERIAL NOT NULL,
    "rotaId" INTEGER NOT NULL,
    "pontoId" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL,
    "horario" TEXT NOT NULL,

    CONSTRAINT "Itinerario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Itinerario_rotaId_idx" ON "Itinerario"("rotaId");

-- CreateIndex
CREATE INDEX "Itinerario_pontoId_idx" ON "Itinerario"("pontoId");

-- CreateIndex
CREATE UNIQUE INDEX "Itinerario_rotaId_ordem_key" ON "Itinerario"("rotaId", "ordem");

-- AddForeignKey
ALTER TABLE "Itinerario" ADD CONSTRAINT "Itinerario_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerario" ADD CONSTRAINT "Itinerario_pontoId_fkey" FOREIGN KEY ("pontoId") REFERENCES "Ponto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
