-- CreateTable
CREATE TABLE "Linha" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Linha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rota" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "linhaId" INTEGER NOT NULL,

    CONSTRAINT "Rota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ponto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "rotaId" INTEGER NOT NULL,

    CONSTRAINT "Ponto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rota" ADD CONSTRAINT "Rota_linhaId_fkey" FOREIGN KEY ("linhaId") REFERENCES "Linha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ponto" ADD CONSTRAINT "Ponto_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
