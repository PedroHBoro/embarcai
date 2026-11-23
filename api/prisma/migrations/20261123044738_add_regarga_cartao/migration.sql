-- CreateEnum
CREATE TYPE "StatusRecarga" AS ENUM ('PENDENTE', 'PAGA', 'FALHOU');

-- CreateTable
CREATE TABLE "Recarga" (
    "id" SERIAL NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "status" "StatusRecarga" NOT NULL DEFAULT 'PENDENTE',
    "stripeSessionId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cartaoId" INTEGER NOT NULL,
    "perfilId" INTEGER NOT NULL,

    CONSTRAINT "Recarga_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recarga_stripeSessionId_key" ON "Recarga"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Recarga_perfilId_criadoEm_idx" ON "Recarga"("perfilId", "criadoEm");

-- AddForeignKey
ALTER TABLE "Recarga" ADD CONSTRAINT "Recarga_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recarga" ADD CONSTRAINT "Recarga_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
