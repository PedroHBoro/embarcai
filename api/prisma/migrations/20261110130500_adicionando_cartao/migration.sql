-- CreateEnum
CREATE TYPE "TipoPasse" AS ENUM ('NORMAL', 'ESTUDANTE');

-- CreateTable
CREATE TABLE "Cartao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "numeroTccc" TEXT NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "perfilId" INTEGER,
    "tipoPasse" "TipoPasse" NOT NULL DEFAULT 'NORMAL',
    "instituicaoEnsino" TEXT,
    "comprovanteResidencia" TEXT,

    CONSTRAINT "Cartao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cartao_numeroTccc_key" ON "Cartao"("numeroTccc");

-- AddForeignKey
ALTER TABLE "Cartao" ADD CONSTRAINT "Cartao_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
