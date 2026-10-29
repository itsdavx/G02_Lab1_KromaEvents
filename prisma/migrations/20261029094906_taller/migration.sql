-- AlterEnum
ALTER TYPE "estado_reserva" ADD VALUE 'ASISTIDA';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_login_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "resenas" (
    "id" SERIAL NOT NULL,
    "calificacion" SMALLINT NOT NULL,
    "comentario" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "evento_id" INTEGER NOT NULL,

    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_historial" (
    "id" SERIAL NOT NULL,
    "estado_anterior" "estado_reserva" NOT NULL,
    "estado_nuevo" "estado_reserva" NOT NULL,
    "nota" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reserva_id" INTEGER NOT NULL,
    "cambiado_por_id" INTEGER NOT NULL,

    CONSTRAINT "reserva_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriaToEvento" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoriaToEvento_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "resenas_evento_id_created_at_idx" ON "resenas"("evento_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "resenas_user_id_evento_id_key" ON "resenas"("user_id", "evento_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE INDEX "reserva_historial_reserva_id_idx" ON "reserva_historial"("reserva_id");

-- CreateIndex
CREATE INDEX "_CategoriaToEvento_B_index" ON "_CategoriaToEvento"("B");

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_historial" ADD CONSTRAINT "reserva_historial_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_historial" ADD CONSTRAINT "reserva_historial_cambiado_por_id_fkey" FOREIGN KEY ("cambiado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToEvento" ADD CONSTRAINT "_CategoriaToEvento_A_fkey" FOREIGN KEY ("A") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToEvento" ADD CONSTRAINT "_CategoriaToEvento_B_fkey" FOREIGN KEY ("B") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

