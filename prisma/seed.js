// Carga datos de prueba sin tocar la base a mano: npx prisma db seed
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/db/prisma"); // el mismo cliente (con adaptador) que usa la API

const reservar = (evento, clienteId, cantidad, estado) =>
  prisma.evento.update({
    where: { id: evento.id },
    data: {
      cuposDisponibles: { decrement: estado === "CANCELADA" ? 0 : cantidad },
      reservas: {
        create: { clienteId, cantidad, precioUnitario: evento.precio, total: evento.precio.mul(cantidad), estado },
      },
    },
  });

async function main() {
  await prisma.reserva.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();
  await prisma.evento.deleteMany();

  await prisma.evento.createMany({
    data: [
      {
        nombre: "Concierto Sinfónico de Gala",
        fecha: new Date("2026-11-14"),
        lugar: "Auditorio Central, Quito",
        capacidad: 300,
        cuposDisponibles: 300,
        precio: 15,
      },
      {
        nombre: "Feria Gastronómica Andina",
        fecha: new Date("2026-11-28"),
        lugar: "Parque La Carolina, Quito",
        capacidad: 500,
        cuposDisponibles: 500,
        precio: 5,
      },
      {
        nombre: "Taller de Fotografía Urbana",
        fecha: new Date("2026-12-05"),
        lugar: "Sala Kroma, Sangolquí",
        capacidad: 30,
        cuposDisponibles: 30,
        precio: 15,
      },
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
  const ana = await prisma.user.create({
    data: {
      email: "ana.torres@correo.com",
      password: await bcrypt.hash("Ana12345*", 10),
      name: "Ana Lucía Torres",
      cliente: { create: { nombres: "Ana Lucía Torres", correo: "ana.torres@correo.com", telefono: "0991234567" } },
    },
    include: { cliente: true },
  });
  const carlos = await prisma.user.create({
    data: {
      email: "carlos.mena@correo.com",
      password: await bcrypt.hash("Carlos123*", 10),
      name: "Carlos Andrés Mena",
      cliente: { create: { nombres: "Carlos Andrés Mena", correo: "carlos.mena@correo.com" } },
    },
    include: { cliente: true },
  });

  const concierto = await prisma.evento.findUnique({ where: { nombre: "Concierto Sinfónico de Gala" } });
  const feria = await prisma.evento.findUnique({ where: { nombre: "Feria Gastronómica Andina" } });
  const taller = await prisma.evento.findUnique({ where: { nombre: "Taller de Fotografía Urbana" } });

  await reservar(concierto, ana.cliente.id, 2, "CONFIRMADA");
  await reservar(feria, carlos.cliente.id, 4, "PENDIENTE");
  await reservar(taller, carlos.cliente.id, 1, "CANCELADA");

  const eventos = await prisma.evento.count();
  const clientes = await prisma.cliente.count();
  const usuarios = await prisma.user.count();
  const reservas = await prisma.reserva.count();
  console.log(`Seed completado: ${eventos} eventos, ${clientes} clientes, ${usuarios} usuarios y ${reservas} reservas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
