require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const updateEducation = async () => {
  console.log("Updating maximum education level");
  const candidates = await CandidateModel.find({});
  await Promise.all(
    candidates.map(async (candidate) => {
      let educacion_mayor_nivel = "";
      // Evaluate primary education first
      if (candidate.educacion.basica.primaria_concluida == true) {
        educacion_mayor_nivel = "Primaria";
        // If no primary, then nothing
      } else {
        educacion_mayor_nivel = "No registra";
      }
      // Evaluate secondary education for possible overrides
      if (candidate.educacion.basica.secundaria_concluida == true) {
        educacion_mayor_nivel = "Secundaria";
      }
      // Evaluate non-university superior education for possible overrides
      if (candidate.educacion.no_universitaria.length > 0) {
        candidate.educacion.no_universitaria.map(async (no_universitaria) => {
          if (no_universitaria.concluida.boolean == true) {
            educacion_mayor_nivel = "Superior - No Universitaria";
          }
        });
      }
      // Evaluate technical superior education for possible overrides
      if (candidate.educacion.tecnica.length > 0) {
        candidate.educacion.tecnica.map(async (tecnica) => {
          if (tecnica.concluida.boolean == true) {
            educacion_mayor_nivel = "Superior - Técnica";
          }
        });
      }
      // Evaluate university superior education for possible overrides
      if (candidate.educacion.universitaria.length > 0) {
        candidate.educacion.universitaria.map(async (universitaria) => {
          if (
            universitaria.concluida == true ||
            universitaria.bachiller == true
          ) {
            educacion_mayor_nivel = "Superior - Universitaria";
          }
        });
      }
      // Evaluate postgrade superior education for possible overrides
      if (candidate.educacion.postgrado.length > 0) {
        candidate.educacion.postgrado.map(async (postgrado) => {
          if (postgrado.concluida.boolean == true) {
            educacion_mayor_nivel = "Postgrado";
          }
        });
      }
      // Finally, update the DB entry
      await CandidateModel.updateOne(
        { _id: candidate._id },
        {
          $set: {
            educacion_mayor_nivel: educacion_mayor_nivel,
          },
        }
      );
    })
  );
  console.log("Finished updating candidates education");
};

updateEducation();
