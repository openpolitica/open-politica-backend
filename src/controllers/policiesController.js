const policiesService = require("../services/policiesService");
const responseBuilder = require("../utils/responseBuilder");

const getTopics = async (req, res) => {
  try {
    let result = await policiesService.getTopics();
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const getQuestions = async (req, res) => {
  try {
    let result = await policiesService.getQuestions(req.query);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const getPolicyResults = async (req, res) => {
  try {
    let result = await policiesService.getPolicyResults(req.body);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

module.exports = {
  getTopics,
  getQuestions,
  getPolicyResults
};
