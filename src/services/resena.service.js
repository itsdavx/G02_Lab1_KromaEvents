const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

const resenaSelect = {
  id: true,
  calificacion: true,
  comentario: true,
  createdAt: true,
  eventoId: true,
  user: { select: { id: true, name: true } },
};

const toInt = (value, def, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return def;
  return max ? Math.min(n, max) : n;
};

const validate = ({ calificacion, comentario }) => {
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5)
    return "calificacion debe ser un número entero entre 1 y 5";

  if (comentario !== undefined && comentario !== null && (typeof comentario !== "string" || comentario.length > 300))
    return "comentario debe ser un texto de máximo 300 caracteres";

  return null;
};

const ensureEvento = async (eventoId) => {
  const evento = await prisma.evento.findUnique({ where: { id: eventoId }, select: { id: true } });
  if (!evento) throw new HttpError(404, "Evento no encontrado");
};

const create = async (user, eventoId, data) => {
  const error = validate(data);
  if (error) throw new HttpError(400, error);

  await ensureEvento(eventoId);

  const asistio = await prisma.cliente.count({
    where: { userId: user.id, reservas: { some: { eventoId, estado: "ASISTIDA" } } },
  });
  if (asistio === 0) throw new HttpError(403, "Solo puede reseñar quien asistió al evento");

  try {
    return await prisma.resena.create({
      data: {
        calificacion: data.calificacion,
        comentario: data.comentario?.trim() || null,
        userId: user.id,
        eventoId,
      },
      select: resenaSelect,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")
      throw new HttpError(409, "Ya reseñaste este evento");
    throw err;
  }
};

const listByEvento = async (eventoId, { page, limit }) => {
  await ensureEvento(eventoId);

  const where = { eventoId };
  const take = toInt(limit, 10, 50);
  const pagina = toInt(page, 1);

  const [stats, data] = await prisma.$transaction([
    prisma.resena.aggregate({ where, _avg: { calificacion: true }, _count: { _all: true } }),
    prisma.resena.findMany({
      where,
      select: resenaSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (pagina - 1) * take,
      take,
    }),
  ]);

  const total = stats._count._all;
  const promedio = stats._avg.calificacion === null ? null : Math.round(stats._avg.calificacion * 100) / 100;

  return { eventoId, promedio, total, page: pagina, limit: take, pages: Math.ceil(total / take), data };
};

const remove = async (user, id) => {
  const resena = await prisma.resena.findUnique({ where: { id }, select: { userId: true } });
  if (!resena) throw new HttpError(404, "Reseña no encontrada");
  if (resena.userId !== user.id && user.role !== "ADMIN")
    throw new HttpError(403, "Solo el autor o un administrador puede eliminar la reseña");

  const { count } = await prisma.resena.deleteMany({ where: { id } });
  if (count === 0) throw new HttpError(404, "Reseña no encontrada");
};

module.exports = { create, listByEvento, remove };
