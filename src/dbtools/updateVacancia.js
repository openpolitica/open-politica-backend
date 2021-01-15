require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const PARTIDOS_VACANCIA = [
  "ACCION POPULAR",
  "ALIANZA PARA EL PROGRESO",
  "EL FRENTE AMPLIO POR JUSTICIA, VIDA Y LIBERTAD",
  "FUERZA POPULAR",
  "PARTIDO DEMOCRATICO SOMOS PERU",
  "PODEMOS PERU",
  "UNION POR EL PERU",
  "FRENTE POPULAR AGRICOLA FIA DEL PERU - FREPAP",
];

const updateCandidates = async () => {
  console.log("Updating candidates");
  const candidates = await CandidateModel.find({});
  await Promise.all(
    candidates.map(async (candidateElement) => {
      // Update "Vacancia"
      if (PARTIDOS_VACANCIA.includes(candidateElement.org_politica_nombre)) {
        await CandidateModel.updateOne(
          { _id: candidateElement._id },
          { $set: { vacancia: true } }
        );
      } else {
        await CandidateModel.updateOne(
          { _id: candidateElement._id },
          { $set: { vacancia: false } }
        );
      }
    })
  );
};

updateCandidates();
