const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de autenticación: reglas, hash de contraseñas y emisión del JWT

// Campos que se devuelven del usuario: nunca la contraseña
const publicUser = { id: true, email: true, name: true, role: true, cliente: true };

const normalizeEmail = (email) => email.trim().toLowerCase();

const validateRegister = ({ email, password, name, phone }) => {
  if (typeof email !== "string" || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "email es obligatorio, debe tener un formato válido y máximo 120 caracteres";

  if (typeof password !== "string" || password.length < 8)
    return "password es obligatoria y debe tener al menos 8 caracteres";

  if (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 100)
    return "name es obligatorio y debe tener entre 3 y 100 caracteres";

  if (phone !== undefined && (typeof phone !== "string" || !/^\d{7,15}$/.test(phone)))
    return "phone es opcional y debe tener entre 7 y 15 dígitos";

  return null;
};

// TODO Paso 1 (clase «Registro de usuarios»): valida email, password (8+) y name → 400.
// Hashea con bcrypt.hash(password, 10) y crea el usuario CON su perfil en una escritura anidada:
// prisma.user.create({ data: { ..., customer: { create: { fullName: name, email, phone } } }, select: publicUser })
// Un email repetido lanza P2002 y errorHandler responde 409.
const register = async ({ email, password, name, phone }) => {
  const error = validateRegister({ email, password, name, phone });
  if (error) throw new HttpError(400, error);

  const correo = normalizeEmail(email);
  const nombres = name.trim();

  return prisma.user.create({
    data: {
      email: correo,
      password: await bcrypt.hash(password, 10),
      name: nombres,
      cliente: { create: { nombres, correo, telefono: phone } },
    },
    select: publicUser,
  });
};

// TODO Paso 1 (clase «Autenticación con JWT»): busca con findUnique({ where: { email } }),
// compara con bcrypt.compare. Si el usuario no existe O la clave no coincide → 401 con el MISMO mensaje.
// Devuelve jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "4h" })
const login = async ({ email, password }) => {
  if (typeof email !== "string" || typeof password !== "string" || email.trim() === "" || password === "")
    throw new HttpError(400, "email y password son obligatorios");

  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new HttpError(401, "Correo o contraseña inválidos");

  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "4h",
  });
};

const getProfile = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!user) throw new HttpError(404, "Usuario no encontrado");
  return user;
};

module.exports = { register, login, getProfile };
