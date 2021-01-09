class queryResponse {
  constructor() {
    this.status = "";
    this.statusCode = 0;
    this.data = null;
    this.message = "";
  }

  success(data, method, statusCode = 200) {
    this.status = "Success";
    this.statusCode = statusCode;
    this.data = data;
    this.message = this.getMessageFromMethod(method);
  }

  error(errorRecieved) {
    this.status = "Error";
    this.message = errorRecieved.message
      ? errorRecieved.message
      : "Error interno, intente nuevamente.";
    this.data = [];
    this.statusCode = errorRecieved.statusCode ? errorRecieved.statusCode : 500;
  }

  getStatusCode() {
    return this.statusCode;
  }

  getMessageFromMethod(method) {
    switch (method) {
      case "GET":
        return "Información obtenida con éxito";
      case "POST":
        return "Información agregada con éxito";
      case "PUT":
        return "Información modificada con éxito";
      case "DELETE":
        return "Información eliminada con éxito";
      default:
        return "";
    }
  }
}

module.exports = new queryResponse();
