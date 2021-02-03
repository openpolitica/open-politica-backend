const locationsService = require("../services/locationsService");
const responseBuilder = require("../utils/responseBuilder");

const getLocations = async (req, res) => {
  try {
    let result = await locationsService.getLocations(req.query);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

const getLocationSeats = async (req, res) => {
  try {
    let result = await locationsService.getLocationSeats(req.params.location);
    responseBuilder.success(result, req.method);
  } catch (error) {
    responseBuilder.error(error);
  } finally {
    return res.status(responseBuilder.getStatusCode()).json(responseBuilder);
  }
};

module.exports = {
  getLocations,
  getLocationSeats,
};
