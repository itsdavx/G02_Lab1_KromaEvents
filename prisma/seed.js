// Carga datos de prueba sin tocar la base a mano: npx prisma db seed
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/db/prisma"); // el mismo cliente (con adaptador) que usa la API

const pasos = (estado, adminId, clienteUserId) => {
  const confirmar = { estadoAnterior: "PENDIENTE", estadoNuevo: "CONFIRMADA", nota: "Pago verificado", cambiadoPorId: adminId };
  if (estado === "CONFIRMADA") return [confirmar];
  if (estado === "ASISTIDA")
    return [
      confirmar,
      { estadoAnterior: "CONFIRMADA", estadoNuevo: "ASISTIDA", nota: "Asistencia registrada en la entrada", cambiadoPorId: adminId },
    ];
  if (estado === "CANCELADA")
    return [{ estadoAnterior: "PENDIENTE", estadoNuevo: "CANCELADA", nota: "Cancelada por el cliente", cambiadoPorId: clienteUserId }];
  return [];
};

const reservar = (evento, usuario, cantidad, estado, adminId) =>
  prisma.evento.update({
    where: { id: evento.id },
    data: {
      cuposDisponibles: { decrement: estado === "CANCELADA" ? 0 : cantidad },
      reservas: {
        create: {
          clienteId: usuario.cliente.id,
          cantidad,
          precioUnitario: evento.precio,
          total: evento.precio.mul(cantidad),
          estado,
          historial: { create: pasos(estado, adminId, usuario.id) },
        },
      },
    },
  });

async function main() {
  await prisma.resena.deleteMany();
  await prisma.reservaHistorial.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();
  await prisma.categoria.deleteMany();
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
      {
        nombre: "Noche de Jazz KromaEvents",
        fecha: new Date("2026-10-17"),
        lugar: "Teatro Sucre, Quito",
        capacidad: 80,
        cuposDisponibles: 80,
        precio: 12,
      },
    ],
  });

  const admin = await prisma.user.create({
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
  const jazz = await prisma.evento.findUnique({ where: { nombre: "Noche de Jazz KromaEvents" } });

  await reservar(concierto, ana, 2, "CONFIRMADA", admin.id);
  await reservar(feria, carlos, 4, "PENDIENTE", admin.id);
  await reservar(taller, carlos, 1, "CANCELADA", admin.id);
  await reservar(jazz, ana, 2, "ASISTIDA", admin.id);
  await reservar(jazz, carlos, 1, "ASISTIDA", admin.id);

  const categorias = [
    { nombre: "Música", eventos: [concierto, jazz] },
    { nombre: "Gastronomía", eventos: [feria] },
    { nombre: "Talleres", eventos: [taller] },
    { nombre: "Cultura", eventos: [concierto, feria, jazz] },
  ];
  for (const { nombre, eventos } of categorias) {
    await prisma.categoria.create({
      data: { nombre, eventos: { connect: eventos.map((e) => ({ id: e.id })) } },
    });
  }

  const eventos = await prisma.evento.count();
  const clientes = await prisma.cliente.count();
  const usuarios = await prisma.user.count();
  const reservas = await prisma.reserva.count();
  const totalCategorias = await prisma.categoria.count();
  console.log(
    `Seed completado: ${eventos} eventos, ${clientes} clientes, ${usuarios} usuarios, ${reservas} reservas y ${totalCategorias} categorías`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
