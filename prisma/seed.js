// Carga datos de prueba sin tocar la base a mano: npx prisma db seed
require("dotenv").config();
const prisma = require("../src/db/prisma"); // el mismo cliente (con adaptador) que usa la API

async function main() {
  await prisma.evento.deleteMany();
  await prisma.cliente.deleteMany();

  await prisma.evento.createMany({
    data: [
      {
        nombre: "Concierto Sinfónico de Gala",
        fecha: new Date("2026-11-14"),
        lugar: "Auditorio Central, Quito",
        capacidad: 300,
        precio: 15,
      },
      {
        nombre: "Feria Gastronómica Andina",
        fecha: new Date("2026-11-28"),
        lugar: "Parque La Carolina, Quito",
        capacidad: 500,
        precio: 5,
      },
      {
        nombre: "Taller de Fotografía Urbana",
        fecha: new Date("2026-12-05"),
        lugar: "Sala Kroma, Sangolquí",
        capacidad: 30,
        precio: 15,
      },
    ],
  });

  await prisma.cliente.createMany({
    data: [
      { nombres: "Ana Lucía Torres", correo: "ana.torres@correo.com", telefono: "0991234567" },
      { nombres: "Carlos Andrés Mena", correo: "carlos.mena@correo.com" },
    ],
  });

  const eventos = await prisma.evento.count();
  const clientes = await prisma.cliente.count();
  console.log(`Seed completado: ${eventos} eventos y ${clientes} clientes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
