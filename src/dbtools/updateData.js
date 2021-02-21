require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const updateData = async () => {
  console.log("Start updating candidates data");

  // Candidata Trans-género Gahela
  await CandidateModel.updateOne(
    { hoja_vida_id: 136670 },
    {
      $set: {
        id_sexo: "F",
        id_nombres: "GAHELA TSENEG",
      },
    }
  );

  console.log("Finished updating candidates data");
};

updateData();
