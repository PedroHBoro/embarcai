-- DropForeignKey
ALTER TABLE "InstituicaoEnsino" DROP CONSTRAINT "InstituicaoEnsino_municipioId_fkey";

-- DropForeignKey
ALTER TABLE "Rota" DROP CONSTRAINT "Rota_linhaId_fkey";

-- DropForeignKey
ALTER TABLE "Recarga" DROP CONSTRAINT "Recarga_cartaoId_fkey";

-- DropForeignKey
ALTER TABLE "Viagem" DROP CONSTRAINT "Viagem_cartaoId_fkey";

-- DropForeignKey
ALTER TABLE "Viagem" DROP CONSTRAINT "Viagem_pontoRotaId_fkey";

-- AddForeignKey
ALTER TABLE "InstituicaoEnsino" ADD CONSTRAINT "InstituicaoEnsino_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rota" ADD CONSTRAINT "Rota_linhaId_fkey" FOREIGN KEY ("linhaId") REFERENCES "Linha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recarga" ADD CONSTRAINT "Recarga_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viagem" ADD CONSTRAINT "Viagem_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "Cartao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viagem" ADD CONSTRAINT "Viagem_pontoRotaId_fkey" FOREIGN KEY ("pontoRotaId") REFERENCES "Itinerario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
