const candidateService = require("../services/candidatesService");
const responseBuilder = require("../utils/responseBuilder");

const getCandidates = async (req, res) => {
  try {
    let result = await candidateService.getCandidates(req.query);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const getCandidateByHojaDeVida = async (req, res) => {
  try {
    let result = await candidateService.getCandidateByHojaDeVida(
      req.params.hoja_vida_id
    );
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const getCandidateByDNI = async (req, res) => {
  try {
    let result = await candidateService.getCandidateByDNI(req.params.id_dni);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const getCandidateById = async (req, res) => {
  try {
    let result = await candidateService.getCandidateById(req.params.id);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

module.exports = {
  getCandidates,
  getCandidateByHojaDeVida,
  getCandidateByDNI,
  getCandidateById
};
