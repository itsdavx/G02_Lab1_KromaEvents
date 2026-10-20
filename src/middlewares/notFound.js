const HttpError = require("../utils/httpError");

// 404 cuando ninguna ruta coincide
const notFound = (req, res, next) => {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
