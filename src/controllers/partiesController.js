const { PartyModel } = require("../models");

const getParties = async (req, res) => {
  const parties = await PartyModel.find().sort({
    name: "asc"
  });
  res.send(parties);
};

const findOneParty = async (req, res) => {
  const party = await PartyModel.findOne({ _id: req.params.id });
  res.send(party);
};

const createParty = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(422).send({ error: "You must provide a name" });
  }

  try {
    const party = new PartyModel(req.body);
    await party.save();

    res.send(party);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
};

const modifyOneParty = async (req, res) => {
  const party = await PartyModel.findOne({ _id: req.params.id });
  Object.assign(party, req.body);
  await party.save();
  res.send("modified");
};

const deleteOneParty = async (req, res) => {
  await PartyModel.deleteOne({ _id: req.params.id });
  res.send("success");
};

module.exports = {
  getParties,
  findOneParty,
  createParty,
  modifyOneParty,
  deleteOneParty
};
