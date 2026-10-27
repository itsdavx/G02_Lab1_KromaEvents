-- CreateEnum
CREATE TYPE "estado_reserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "eventos" ADD COLUMN     "cupos_disponibles" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "precio" SET DATA TYPE DECIMAL(10,2);
UPDATE "eventos" SET "cupos_disponibles" = "capacidad";
ALTER TABLE "eventos" ALTER COLUMN "cupos_disponibles" DROP DEFAULT;

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "estado" "estado_reserva" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_reserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente_id" INTEGER NOT NULL,
    "evento_id" INTEGER NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservas_cliente_id_idx" ON "reservas"("cliente_id");

-- CreateIndex
CREATE INDEX "reservas_evento_id_estado_idx" ON "reservas"("evento_id", "estado");

-- CreateIndex
CREATE INDEX "reservas_estado_fecha_reserva_idx" ON "reservas"("estado", "fecha_reserva");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

