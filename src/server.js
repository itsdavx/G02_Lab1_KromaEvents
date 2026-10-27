// Punto de entrada: carga .env e inicia el servidor
require("dotenv").config();
const app = require("./app");
const prisma = require("./db/prisma");

const PORT = process.env.PORT || 3000;

const start = async () => {
  if (!process.env.JWT_SECRET) throw new Error("Falta la variable JWT_SECRET");
  await prisma.$connect();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT} · PostgreSQL conectado`);
  });
};

start().catch((err) => {
  console.error("No se pudo conectar a la base de datos:", err.message);
  process.exit(1);
});
