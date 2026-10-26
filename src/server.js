// Punto de entrada: carga .env, verifica la conexión con PostgreSQL e inicia el servidor
require("dotenv").config();
const app = require("./app");
const prisma = require("./db/prisma");

const PORT = process.env.PORT || 3000;

// Solo escucha peticiones si la base de datos responde
const start = async () => {
  await prisma.$connect();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT} · PostgreSQL conectado`);
  });
};

start().catch((err) => {
  console.error("No se pudo conectar a la base de datos:", err.message);
  process.exit(1);
});
