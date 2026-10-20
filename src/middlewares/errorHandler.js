// Responde todos los errores en JSON
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  // TODO Paso 3: JSON mal formado → 400; error 500 → "Error interno del servidor" (stack solo en desarrollo)
  res.status(status).json({ error: err.message });
};

module.exports = errorHandler;
