require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const removeDuplicates = async () => {
  console.log("Removing duplicate candidates");
  var previousID;
  const candidates = await CandidateModel.find({}).sort("hoja_vida_id");
  await Promise.all(
    candidates.map(async (candidate) => {
      var hoja_vida_id = candidate.hoja_vida_id;
      if (hoja_vida_id == previousID) {
        console.log(candidate.id_nombres, candidate.cargo_nombre);
        candidate.remove();
      }
      previousID = hoja_vida_id;
    })
  );
  console.log("Finished removing duplicate candidates");
};

removeDuplicates();
