// Carga datos de prueba sin tocar la base a mano: npx prisma db seed
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/db/prisma"); // el mismo cliente (con adaptador) que usa la API

async function main() {
  await prisma.evento.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();

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

  await prisma.user.create({
    data: {
      email: "admin@kromaevents.com",
      password: await bcrypt.hash("Admin123*", 10),
      name: "Administración KromaEvents",
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      email: "sofia.ramirez@correo.com",
      password: await bcrypt.hash("Sofia123*", 10),
      name: "Sofía Ramírez",
      cliente: { create: { nombres: "Sofía Ramírez", correo: "sofia.ramirez@correo.com", telefono: "0987654321" } },
    },
  });

  const eventos = await prisma.evento.count();
  const clientes = await prisma.cliente.count();
  const usuarios = await prisma.user.count();
  console.log(`Seed completado: ${eventos} eventos, ${clientes} clientes y ${usuarios} usuarios`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
