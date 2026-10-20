// Error con código HTTP que errorHandler convierte en respuesta JSON
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
