const { CandidateModel } = require("../models");

getCandidates = async (req, res) => {
  const { page = 1, limit = 10, party, role } = req.query;

  let query = {};
  if (party) {
    query.org_politica_nombre = party;
  }
  if (role) {
    query.cargo_nombre = role;
  }

  const candidates = await CandidateModel.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await CandidateModel.countDocuments();

  res.json({
    candidates,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
};

getCandidateByHojaDeVida = async (req, res) => {
  const candidate = await CandidateModel.findOne({
    hoja_vida_id: req.params.hoja_vida_id
  });
  res.send(candidate);
};

getCandidateByDNI = async (req, res) => {
  const candidate = await CandidateModel.findOne({
    id_dni: { string: req.params.id_dni }
  });
  res.send(candidate);
};

getCandidateById = async (req, res) => {
  const candidate = await CandidateModel.findOne({ _id: req.params.id });
  res.send(candidate);
};

createCandidate = async (req, res) => {
  try {
    const candidate = new CandidateModel(req.body);
    await candidate.save();

    res.send(candidate);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
};

modifyCandidateById = async (req, res) => {
  const candidate = await CandidateModel.findOne({ _id: req.params.id });
  Object.assign(candidate, req.body);
  await candidate.save();
  res.send("modified");
};

deleteCandidate = async (req, res) => {
  await CandidateModel.deleteOne({ _id: req.params.id });
  res.send("success");
};

module.exports = {
  getCandidates,
  getCandidateByHojaDeVida,
  getCandidateByDNI,
  getCandidateById,
  createCandidate,
  modifyCandidateById,
  deleteCandidate
};
