-- CreateTable
CREATE TABLE "Viagem" (
    "id" SERIAL NOT NULL,
    "saldoGasto" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "perfilId" INTEGER NOT NULL,
    "cartaoId" INTEGER NOT NULL,
    "pontoRotaId" INTEGER NOT NULL,

    CONSTRAINT "Viagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Viagem_perfilId_criadoEm_idx" ON "Viagem"("perfilId", "criadoEm");

-- AddForeignKey
ALTER TABLE "Viagem" ADD CONSTRAINT "Viagem_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viagem" ADD CONSTRAINT "Viagem_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viagem" ADD CONSTRAINT "Viagem_pontoRotaId_fkey" FOREIGN KEY ("pontoRotaId") REFERENCES "Itinerario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
