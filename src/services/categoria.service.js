const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

const categoriaSelect = { id: true, nombre: true };

const SORTS = {
  precio_asc: [{ precio: "asc" }, { id: "asc" }],
  precio_desc: [{ precio: "desc" }, { id: "asc" }],
  nombre: [{ nombre: "asc" }, { id: "asc" }],
};

const toInt = (value, def, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return def;
  return max ? Math.min(n, max) : n;
};

const texto = (value, campo) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new HttpError(400, `${campo} debe enviarse una sola vez`);
  const limpio = value.trim();
  return limpio === "" ? undefined : limpio;
};

const precio = (value, campo) => {
  const limpio = texto(value, campo);
  if (limpio === undefined) return undefined;
  const n = Number(limpio);
  if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `${campo} debe ser un número mayor o igual a 0`);
  return n;
};

const paginar = async (where, orderBy, { page, limit }) => {
  const take = toInt(limit, 10, 50);
  const pagina = toInt(page, 1);

  const [total, data] = await prisma.$transaction([
    prisma.evento.count({ where }),
    prisma.evento.findMany({
      where,
      include: { categorias: { select: categoriaSelect, orderBy: { nombre: "asc" } } },
      orderBy,
      skip: (pagina - 1) * take,
      take,
    }),
  ]);

  return { page: pagina, limit: take, total, pages: Math.ceil(total / take), data };
};

const create = async ({ nombre }) => {
  if (typeof nombre !== "string" || nombre.trim() === "" || nombre.trim().length > 50)
    throw new HttpError(400, "nombre es obligatorio y debe tener máximo 50 caracteres");

  const limpio = nombre.trim();
  const existe = await prisma.categoria.findFirst({ where: { nombre: { equals: limpio, mode: "insensitive" } } });
  if (existe) throw new HttpError(409, "Ya existe una categoría con ese nombre");

  try {
    return await prisma.categoria.create({ data: { nombre: limpio }, select: categoriaSelect });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")
      throw new HttpError(409, "Ya existe una categoría con ese nombre");
    throw err;
  }
};

const list = () =>
  prisma.categoria.findMany({
    select: { ...categoriaSelect, _count: { select: { eventos: true } } },
    orderBy: { nombre: "asc" },
  });

const setEventoCategorias = async (eventoId, categoriaIds) => {
  if (!Array.isArray(categoriaIds) || !categoriaIds.every((id) => Number.isInteger(id) && id > 0))
    throw new HttpError(400, "categoriaIds debe ser un arreglo de ids enteros");

  const ids = [...new Set(categoriaIds)];

  return prisma.$transaction(async (tx) => {
    const evento = await tx.evento.findUnique({ where: { id: eventoId }, select: { id: true } });
    if (!evento) throw new HttpError(404, "Evento no encontrado");

    const encontradas = await tx.categoria.findMany({ where: { id: { in: ids } }, select: { id: true } });
    const faltan = ids.filter((id) => !encontradas.some((c) => c.id === id));
    if (faltan.length > 0) throw new HttpError(404, `Categoría no encontrada: ${faltan.join(", ")}`);

    return tx.evento.update({
      where: { id: eventoId },
      data: { categorias: { set: ids.map((id) => ({ id })) } },
      include: { categorias: { select: categoriaSelect, orderBy: { nombre: "asc" } } },
    });
  });
};

const buscarEventos = async ({ q, categoria, min, max, sort, page, limit }) => {
  const orden = texto(sort, "sort") ?? "nombre";
  if (!SORTS[orden]) throw new HttpError(400, `sort debe ser uno de: ${Object.keys(SORTS).join(", ")}`);

  const minimo = precio(min, "min");
  const maximo = precio(max, "max");
  if (minimo !== undefined && maximo !== undefined && minimo > maximo)
    throw new HttpError(400, "min no puede ser mayor que max");

  const busqueda = texto(q, "q");
  const nombreCategoria = texto(categoria, "categoria");

  const where = {
    nombre: busqueda ? { contains: busqueda, mode: "insensitive" } : undefined,
    categorias: nombreCategoria ? { some: { nombre: { equals: nombreCategoria, mode: "insensitive" } } } : undefined,
    precio: minimo !== undefined || maximo !== undefined ? { gte: minimo, lte: maximo } : undefined,
  };

  return paginar(where, SORTS[orden], { page, limit });
};

const listEventos = async (categoriaId, query) => {
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId }, select: categoriaSelect });
  if (!categoria) throw new HttpError(404, "Categoría no encontrada");

  const resultado = await paginar({ categorias: { some: { id: categoriaId } } }, [{ fecha: "asc" }, { id: "asc" }], query);
  return { categoriaId, nombre: categoria.nombre, ...resultado };
};

module.exports = { create, list, setEventoCategorias, buscarEventos, listEventos };
