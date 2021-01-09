const { PartyModel } = require("../models");

const getParties = async () => {
  return await PartyModel.find().sort({
    name: "asc"
  });
};

const findOneParty = async (_id) => {
  return await PartyModel.findOne({ _id });
};

module.exports = {
  getParties,
  findOneParty
};
