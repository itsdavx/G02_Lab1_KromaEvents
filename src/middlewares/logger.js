// Registra hora, verbo, ruta, código de estado y duración de cada petición
const logger = (req, res, next) => {
  const inicio = Date.now();
  const hora = new Date().toLocaleTimeString("es-EC", { hour12: false });

  res.on("finish", () => {
    console.log(`[${hora}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - inicio} ms`);
  });

  next();
};

module.exports = logger;
