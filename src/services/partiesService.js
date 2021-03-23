const db = require("../database");

const getParties = async () => {
  return;
};

const getDirtyLists = async (params) => {
  const { party, region } = params;

  let arguments = [];

  let query = params
    ? "SELECT * FROM dirty_lists d WHERE 1 "
    : "SELECT * FROM dirty_lists d";

  if (party) {
    query += "AND d.org_politica_nombre = ? ";
    arguments.push(party);
  }
  if (region) {
    query += "AND d.postula_distrito = ? ";
    arguments.push(region);
  }

  let lists = [];

  lists = await db.query(query, arguments);
  return {
    lists
  };
};

const findOneParty = async (_id) => {
  return;
};

const findPartyLeaders = async (party) => {
  try {
    if (!party) {
      let error = new Error("Nombre del partido requerido");
      error.statusCode = 400;
      throw error;
    }

    let queryPresidentes = "SELECT a.hoja_vida_id, a.id_nombres, a.id_apellido_paterno, a.id_apellido_materno, a.id_sexo, a.org_politica_nombre, a.enlace_foto, a.cargo_id, a.cargo_nombre, a.org_politica_id, b.alias as org_politica_alias FROM candidato a INNER JOIN partidos_alias b ON a.org_politica_id = b.id WHERE cargo_nombre LIKE '%PRESIDENTE%' AND org_politica_nombre = ?";
    let responsePresidentes = await db.query(queryPresidentes, party);

    const obtainPresidentByCargoId = function (cargoId) {
      return responsePresidentes.find((candidato) => candidato.cargo_id === cargoId);
    }

    return {
      president: obtainPresidentByCargoId(1),
      firstVP: obtainPresidentByCargoId(2),
      secondVP: obtainPresidentByCargoId(3)
    }

  } catch (error) {
    throw error;
  }

}

module.exports = {
  getParties,
  getDirtyLists,
  findOneParty,
  findPartyLeaders
};
