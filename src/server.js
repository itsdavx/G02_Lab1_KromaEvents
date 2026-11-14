// Punto de entrada: carga .env e inicia el servidor
require("dotenv").config();
const app = require("./app");
const prisma = require("./db/prisma");
const { connectMongo } = require("./db/mongo");

const PORT = process.env.PORT || 3000;

// Solo se llama a listen si PostgreSQL y MongoDB se conectan
const start = async () => {
  if (!process.env.JWT_SECRET) throw new Error("Falta la variable JWT_SECRET");
  await prisma.$connect();
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT} · PostgreSQL y MongoDB conectados`);
  });
};

start().catch((err) => {
  console.error("No se pudo conectar a la base de datos:", err.message);
  process.exit(1);
});
