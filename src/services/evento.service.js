const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO (Lab 2): misma interfaz que en el Lab 1, pero ahora persiste con Prisma.
// El modelo ya no es un archivo .js: es el model Evento de prisma/schema.prisma.
// El controlador y las rutas no cambian (salvo la nueva ruta /lote).

const FIELDS = ["nombre", "fecha", "lugar", "capacidad", "precio"];

// Las validaciones de negocio siguen aquí: Prisma valida tipos, no reglas como precio >= 0
// Devuelve el primer error encontrado o null; con partial solo revisa los campos recibidos (PUT)
const validate = (data, { partial = false } = {}) => {
  const debeValidar = (campo) => !partial || data[campo] !== undefined;

  if (debeValidar("nombre") && (typeof data.nombre !== "string" || data.nombre.trim().length < 3))
    return "nombre es obligatorio y debe tener al menos 3 caracteres";

  if (
    debeValidar("fecha") &&
    (typeof data.fecha !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.fecha) ||
      Number.isNaN(Date.parse(data.fecha)))
  )
    return "fecha es obligatoria y debe tener el formato AAAA-MM-DD";

  if (debeValidar("lugar") && (typeof data.lugar !== "string" || data.lugar.trim() === ""))
    return "lugar es obligatorio";

  if (debeValidar("capacidad") && (!Number.isInteger(data.capacidad) || data.capacidad < 1))
    return "capacidad debe ser un número entero mayor o igual a 1";

  if (debeValidar("precio") && (typeof data.precio !== "number" || data.precio < 0))
    return "precio debe ser un número mayor o igual a 0";

  return null;
};

// Copia solo los campos permitidos (evita que guarden propiedades extrañas)
const pick = (data) => {
  const item = Object.fromEntries(FIELDS.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]));
  if (item.fecha !== undefined) item.fecha = new Date(item.fecha);
  return item;
};

const list = () => prisma.evento.findMany({ orderBy: { id: "asc" } });

// Busca un evento por id; 404 si no existe
const getById = async (id) => {
  const item = await prisma.evento.findUnique({ where: { id } });
  if (!item) throw new HttpError(404, "Evento no encontrado");
  return item;
};

// Si el valor @unique se repite, Prisma lanza P2002 y errorHandler responde 409.
const create = async (data) => {
  const error = validate(data);
  if (error) throw new HttpError(400, error);

  return prisma.evento.create({ data: pick(data) });
};

const update = async (id, data) => {
  const error = validate(data, { partial: true });
  if (error) throw new HttpError(400, error);

  await getById(id);
  return prisma.evento.update({ where: { id }, data: pick(data) });
};

const remove = async (id) => {
  const { count } = await prisma.evento.deleteMany({ where: { id } });
  if (count === 0) throw new HttpError(404, "Evento no encontrado");
};

const createMany = (items) =>
  prisma.$transaction(async (tx) => {
    const created = [];
    for (const [i, data] of items.entries()) {
      const error = validate(data);
      if (error) throw new HttpError(400, `Ítem ${i + 1}: ${error}`);
      created.push(await tx.evento.create({ data: pick(data) }));
    }
    return created;
  });

module.exports = { list, getById, create, update, remove, createMany };
