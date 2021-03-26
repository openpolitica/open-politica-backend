const partiesService = require("../services/partiesService");
const responseBuilder = require("../utils/responseBuilder");

const getParties = async (req, res) => {
  try {
    let result = await partiesService.findParties();
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const getDirtyLists = async (req, res) => {
  try {
    let result = await partiesService.getDirtyLists(req.query);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const findOneParty = async (req, res) => {
  try {
    let result = await partiesService.findOneParty(req.params.id);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const getPartyLeaders = async (req, res) => {
  try {
    let result = await partiesService.findPartyLeaders(req.params.party);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

module.exports = {
  getParties,
  getDirtyLists,
  findOneParty,
  getPartyLeaders
};
