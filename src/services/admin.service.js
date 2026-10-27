const { EstadoReserva } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// ADMIN SERVICE: consultas y acciones que solo hace el administrador

const adminInclude = {
  cliente: { select: { id: true, nombres: true, correo: true } },
  evento: { select: { id: true, nombre: true, fecha: true } },
};

const toInt = (value, def, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return def;
  return max ? Math.min(n, max) : n;
};

const parseEstado = (estado) => {
  if (estado === undefined) return undefined;
  if (!Object.values(EstadoReserva).includes(estado))
    throw new HttpError(400, `estado debe ser uno de: ${Object.values(EstadoReserva).join(", ")}`);
  return estado;
};

const parseEventoId = (eventoId) => {
  if (eventoId === undefined) return undefined;
  if (!/^\d+$/.test(eventoId)) throw new HttpError(400, "eventoId debe ser numérico");
  return Number(eventoId);
};

const parseFecha = (value, campo) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)))
    throw new HttpError(400, `${campo} debe tener el formato AAAA-MM-DD`);
  return new Date(value);
};

const DIA_MS = 24 * 60 * 60 * 1000;

// Filtros + paginación + orden + conteo en una sola transacción de lectura
// TODO Paso 3 (clase «Endpoint para listar citas con Prisma»): filtros + paginación.
// where = { estado: parseEstado(estado), fechaReserva: { gte: from && new Date(from), lte: ... } }
// take = toInt(limit, 10, 50); skip = (page - 1) * take
// Usa prisma.$transaction([prisma.reserva.count({ where }), prisma.reserva.findMany({ where, include, orderBy, skip, take })])
// y responde { page, limit, total, pages, data }
const listReservas = async ({ estado, eventoId, from, to, page, limit }) => {
  const desde = parseFecha(from, "from");
  const hasta = parseFecha(to, "to");
  if (desde && hasta && desde > hasta) throw new HttpError(400, "from no puede ser mayor que to");

  const where = {
    estado: parseEstado(estado),
    eventoId: parseEventoId(eventoId),
    fechaReserva: desde || hasta ? { gte: desde, lt: hasta && new Date(hasta.getTime() + DIA_MS) } : undefined,
  };
  const take = toInt(limit, 10, 50);
  const pagina = toInt(page, 1);

  const [total, data] = await prisma.$transaction([
    prisma.reserva.count({ where }),
    prisma.reserva.findMany({
      where,
      include: adminInclude,
      orderBy: { fechaReserva: "desc" },
      skip: (pagina - 1) * take,
      take,
    }),
  ]);

  return { page: pagina, limit: take, total, pages: Math.ceil(total / take), data };
};

const updateReservaEstado = async (id, estado) => {
  if (estado === undefined) throw new HttpError(400, "Envía el nuevo estado");
  const nuevo = parseEstado(estado);

  return prisma.$transaction(async (tx) => {
    const reserva = await tx.reserva.findUnique({ where: { id } });
    if (!reserva) throw new HttpError(404, "Reserva no encontrada");

    if (nuevo === "CANCELADA" && reserva.estado !== "CANCELADA") {
      await tx.evento.update({
        where: { id: reserva.eventoId },
        data: { cuposDisponibles: { increment: reserva.cantidad } },
      });
    }
    if (nuevo !== "CANCELADA" && reserva.estado === "CANCELADA") {
      const { count } = await tx.evento.updateMany({
        where: { id: reserva.eventoId, cuposDisponibles: { gte: reserva.cantidad } },
        data: { cuposDisponibles: { decrement: reserva.cantidad } },
      });
      if (count === 0) throw new HttpError(409, "Cupos insuficientes para reactivar la reserva");
    }

    const { count } = await tx.reserva.updateMany({
      where: { id, estado: reserva.estado },
      data: { estado: nuevo },
    });
    if (count === 0) throw new HttpError(409, "La reserva cambió mientras se actualizaba, intenta de nuevo");

    return tx.reserva.findUnique({ where: { id }, include: adminInclude });
  });
};

// Consulta avanzada: agrupa las reservas por evento y suma los cupos vendidos
// TODO Paso 3 · consulta avanzada: prisma.reserva.groupBy({ by: ["eventoId"], _sum: { cantidad: true },
// where: { estado: { not: "CANCELADA" } }, orderBy: { _sum: { cantidad: "desc" } }, take })
// y agrega el nombre de cada evento → [{ eventoId, nombre, cuposVendidos }]
const topEventos = async (limit) => {
  const filas = await prisma.reserva.groupBy({
    by: ["eventoId"],
    where: { estado: { not: "CANCELADA" } },
    _sum: { cantidad: true, total: true },
    _count: { _all: true },
    orderBy: { _sum: { cantidad: "desc" } },
    take: toInt(limit, 5, 20),
  });

  const eventos = await prisma.evento.findMany({
    where: { id: { in: filas.map((f) => f.eventoId) } },
    select: { id: true, nombre: true },
  });
  const nombres = new Map(eventos.map((e) => [e.id, e.nombre]));

  return filas.map((f) => ({
    eventoId: f.eventoId,
    nombre: nombres.get(f.eventoId),
    cuposVendidos: f._sum.cantidad,
    ingresos: f._sum.total,
    reservas: f._count._all,
  }));
};

module.exports = { listReservas, updateReservaEstado, topEventos };
