const bcrypt = require("bcryptjs");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

const meSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  lastLoginAt: true,
  cliente: {
    select: {
      id: true,
      nombres: true,
      correo: true,
      telefono: true,
      createdAt: true,
      _count: { select: { reservas: true } },
    },
  },
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: meSelect });
  if (!user) throw new HttpError(404, "Usuario no encontrado");
  return user;
};

const validateUpdate = ({ name, phone }) => {
  if (name === undefined && phone === undefined) return "Envía name o phone para actualizar";

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100))
    return "name debe tener entre 3 y 100 caracteres";

  if (phone !== undefined && (typeof phone !== "string" || !/^\d{7,15}$/.test(phone)))
    return "phone debe tener solo números, entre 7 y 15 dígitos";

  return null;
};

const updateMe = async (userId, body) => {
  const error = validateUpdate(body);
  if (error) throw new HttpError(400, error);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { cliente: { select: { id: true } } } });
  if (!user) throw new HttpError(404, "Usuario no encontrado");
  if (body.phone !== undefined && !user.cliente)
    throw new HttpError(400, "El usuario no tiene perfil de cliente donde guardar el teléfono");

  const name = body.name?.trim();

  return prisma.user.update({
    where: { id: userId },
    data: {
      name,
      cliente: user.cliente ? { update: { nombres: name, telefono: body.phone } } : undefined,
    },
    select: meSelect,
  });
};

const changePassword = async (userId, { currentPassword, newPassword } = {}) => {
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || currentPassword === "")
    throw new HttpError(400, "currentPassword y newPassword son obligatorios");
  if (newPassword.length < 8) throw new HttpError(400, "La nueva contraseña debe tener al menos 8 caracteres");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user) throw new HttpError(404, "Usuario no encontrado");
  if (!(await bcrypt.compare(currentPassword, user.password)))
    throw new HttpError(401, "La contraseña actual es incorrecta");
  if (newPassword === currentPassword) throw new HttpError(400, "La nueva contraseña debe ser distinta de la actual");

  await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(newPassword, 10) } });
};

module.exports = { getMe, updateMe, changePassword };
