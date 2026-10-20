// TODO Paso 3: registrar hora, verbo y ruta de cada petición
const logger = (req, res, next) => {
  next();
};

module.exports = logger;
