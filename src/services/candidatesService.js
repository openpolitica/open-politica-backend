const { CandidateModel } = require("../models");

const getCandidates = async (params) => {
  const { page = 1, limit = 10, party, role } = params;

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

  return {
    candidates,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };
};

const getCandidateByHojaDeVida = async (hoja_vida_id) => {
  return await CandidateModel.findOne({
    hoja_vida_id
  });
};

const getCandidateByDNI = async (id_dni) => {
  return await CandidateModel.findOne({
    id_dni: { string: id_dni }
  });
};

const getCandidateById = async (_id) => {
  return await CandidateModel.findOne({ _id });
};

module.exports = {
  getCandidates,
  getCandidateByHojaDeVida,
  getCandidateByDNI,
  getCandidateById
};
