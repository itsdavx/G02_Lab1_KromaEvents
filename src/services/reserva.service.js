const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de reservas: el recurso limitado son los cupos del evento (en citas médicas sería el bloque de tiempo)

// Cómo se devuelve una reserva: con los datos del evento (fetch explícito)
const reservaInclude = {
  evento: { select: { id: true, nombre: true, fecha: true, lugar: true } },
};

const clienteOf = async (userId) => {
  const cliente = await prisma.cliente.findUnique({ where: { userId } });
  if (!cliente) throw new HttpError(403, "El usuario no tiene perfil de cliente");
  return cliente;
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0)
    throw new HttpError(400, "items debe ser un arreglo con al menos un evento");
  for (const [i, it] of items.entries()) {
    if (!Number.isInteger(it?.eventoId) || !Number.isInteger(it?.cantidad) || it.cantidad < 1)
      throw new HttpError(400, `Ítem ${i + 1}: eventoId y cantidad deben ser enteros y cantidad >= 1`);
  }
  if (new Set(items.map((it) => it.eventoId)).size !== items.length)
    throw new HttpError(400, "No repitas el mismo evento: suma las cantidades");
};

// TRANSACCIÓN: descuenta cupos y crea las reservas, o no hace nada
// TODO Paso 3 · TRANSACCIÓN (clase «Servicios y controladores para gestión de reservas»):
// 1. validateItems(items) y clienteOf(userId)
// 2. prisma.$transaction(async (tx) => { ... }) y, por cada ítem:
//    - tx.evento.updateMany({ where: { id, cuposDisponibles: { gte: cantidad } }, data: { cuposDisponibles: { decrement: cantidad } } })
//    - si el evento no existe → 404; si count === 0 → 409 «Cupos insuficientes» (ROLLBACK)
//    - calcula el total y la reserva { eventoId, cantidad, precioUnitario: evento.precio }
// 3. tx.reserva.create({ data: { clienteId, eventoId, cantidad, precioUnitario, total }, include: reservaInclude })
const create = async (userId, items) => {
  validateItems(items);
  const cliente = await clienteOf(userId);

  return prisma.$transaction(async (tx) => {
    const reservas = [];
    for (const { eventoId, cantidad } of items) {
      const evento = await tx.evento.findUnique({ where: { id: eventoId } });
      if (!evento) throw new HttpError(404, `Evento ${eventoId} no encontrado`);

      const { count } = await tx.evento.updateMany({
        where: { id: eventoId, cuposDisponibles: { gte: cantidad } },
        data: { cuposDisponibles: { decrement: cantidad } },
      });
      if (count === 0) throw new HttpError(409, `Cupos insuficientes para el evento «${evento.nombre}»`);

      reservas.push(
        await tx.reserva.create({
          data: {
            clienteId: cliente.id,
            eventoId,
            cantidad,
            precioUnitario: evento.precio,
            total: evento.precio.mul(cantidad),
          },
          include: reservaInclude,
        })
      );
    }
    return reservas;
  });
};

const listByUser = async (userId) => {
  const cliente = await clienteOf(userId);
  return prisma.reserva.findMany({
    where: { clienteId: cliente.id },
    include: reservaInclude,
    orderBy: { fechaReserva: "desc" },
  });
};

// TRANSACCIÓN: cambia el estado y devuelve los cupos al evento
// TODO Paso 3 · TRANSACCIÓN: busca la reserva (404), verifica que sea del cliente (403)
// y que esté PENDIENTE (409). Devuelve los cupos con increment y cambia estado a CANCELADA.
const cancel = async (userId, reservaId) => {
  const cliente = await clienteOf(userId);
  const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });
  if (!reserva) throw new HttpError(404, "Reserva no encontrada");
  if (reserva.clienteId !== cliente.id) throw new HttpError(403, "La reserva no pertenece al usuario");

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.reserva.updateMany({
      where: { id: reservaId, estado: "PENDIENTE" },
      data: { estado: "CANCELADA" },
    });
    if (count === 0) throw new HttpError(409, "Solo se puede cancelar una reserva pendiente");

    await tx.evento.update({
      where: { id: reserva.eventoId },
      data: { cuposDisponibles: { increment: reserva.cantidad } },
    });
    await tx.reservaHistorial.create({
      data: {
        reservaId,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "CANCELADA",
        nota: "Cancelada por el cliente",
        cambiadoPorId: userId,
      },
    });
    return tx.reserva.findUnique({ where: { id: reservaId }, include: reservaInclude });
  });
};

const historial = async (user, reservaId) => {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    select: {
      id: true,
      estado: true,
      cliente: { select: { userId: true } },
      historial: {
        select: {
          id: true,
          estadoAnterior: true,
          estadoNuevo: true,
          nota: true,
          createdAt: true,
          cambiadoPor: { select: { id: true, name: true } },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    },
  });
  if (!reserva) throw new HttpError(404, "Reserva no encontrada");
  if (user.role !== "ADMIN" && reserva.cliente.userId !== user.id)
    throw new HttpError(403, "La reserva no pertenece al usuario");

  return { reservaId: reserva.id, estado: reserva.estado, historial: reserva.historial };
};

module.exports = { create, listByUser, cancel, historial };
