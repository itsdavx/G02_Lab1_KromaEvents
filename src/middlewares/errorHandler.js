// Responde todos los errores en JSON
const errorHandler = (err, req, res, next) => {
  // Cuerpo con JSON mal formado
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }

  const status = err.status || 500;

  // Error no controlado: mensaje genérico; el stack solo se envía fuera de producción
  if (status === 500) {
    console.error(err.stack);
    const body = { error: "Error interno del servidor" };
    if (process.env.NODE_ENV !== "production") body.stack = err.stack;
    return res.status(500).json(body);
  }

  res.status(status).json({ error: err.message });
};

module.exports = errorHandler;
