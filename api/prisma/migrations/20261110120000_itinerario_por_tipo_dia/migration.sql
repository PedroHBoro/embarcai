-- Existing itinerary rows become weekday entries so no schedule is lost.
CREATE TYPE "TipoDia" AS ENUM ('DIA_UTIL', 'SABADO', 'DOMINGO');

ALTER TABLE "Itinerario"
ADD COLUMN "tipoDia" "TipoDia" NOT NULL DEFAULT 'DIA_UTIL';

DROP INDEX "Itinerario_rotaId_ordem_key";
DROP INDEX "Itinerario_rotaId_idx";

CREATE UNIQUE INDEX "Itinerario_rotaId_tipoDia_ordem_key"
ON "Itinerario"("rotaId", "tipoDia", "ordem");

CREATE INDEX "Itinerario_rotaId_tipoDia_idx"
ON "Itinerario"("rotaId", "tipoDia");
