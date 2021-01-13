const { CandidateModel } = require("../models");

const getCandidates = async (params) => {
  const {
    page = 1,
    limit = 10,
    parties,
    region,
    role,
    vacancia,
    sentencias
  } = params;

  let query = {};
  if (parties) {
    query.org_politica_nombre = { $in: parties.split(",") };
  }
  if (role) {
    query.cargo_nombre = role;
  }
  if (region) {
    query.postula_distrito = region;
  }
  if (vacancia) {
    query.vacancia = vacancia;
  }

  var candidates = [];
  if (sentencias === "true") {
    candidates = await CandidateModel.find({
      ...query,
      sentencias_ec: { $exists: true, $ne: [] }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
  } else if (sentencias === "false") {
    candidates = await CandidateModel.find({
      ...query,
      sentencias_ec: { $exists: true, $eq: [] }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
  } else {
    candidates = await CandidateModel.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
  }

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
