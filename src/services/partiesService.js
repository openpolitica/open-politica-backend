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

module.exports = {
  getParties,
  getDirtyLists,
  findOneParty
};
