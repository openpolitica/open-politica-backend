require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const updateEducation = async () => {
  console.log("Updating maximum education level");
  const candidates = await CandidateModel.find({});
  await Promise.all(
    candidates.map(async (candidate) => {
      if (candidate.educacion.postgrado.length > 0) {
        candidate.educacion.postgrado.map(async (postgrado) => {
          console.log("postgrado", postgrado);
          if (postgrado.concluida.boolean == true) {
            await CandidateModel.updateOne(
              { _id: candidate._id },
              {
                $set: {
                  educacion_mayor_nivel: "Postgrado",
                },
              }
            );
          }
        });
      } else if (candidate.educacion.universitaria.length > 0) {
        candidate.educacion.universitaria.map(async (universitaria) => {
          if (universitaria.concluida == true) {
            await CandidateModel.updateOne(
              { _id: candidate._id },
              {
                $set: {
                  educacion_mayor_nivel: "Superior - Universitaria",
                },
              }
            );
          }
        });
      } else if (candidate.educacion.no_universitaria.length > 0) {
        candidate.educacion.no_universitaria.map(async (no_universitaria) => {
          if (no_universitaria.concluida.boolean == true) {
            await CandidateModel.updateOne(
              { _id: candidate._id },
              {
                $set: {
                  educacion_mayor_nivel: "Superior - No Universitaria",
                },
              }
            );
          }
        });
      } else if (candidate.educacion.tecnica.length > 0) {
        candidate.educacion.tecnica.map(async (tecnica) => {
          if (tecnica.concluida.boolean == true) {
            await CandidateModel.updateOne(
              { _id: candidate._id },
              {
                $set: {
                  educacion_mayor_nivel: "Superior - Técnica",
                },
              }
            );
          }
        });
      } else if (candidate.educacion.basica.secundaria_concluida == true) {
        await CandidateModel.updateOne(
          { _id: candidate._id },
          {
            $set: {
              educacion_mayor_nivel: "Secundaria",
            },
          }
        );
      } else if (candidate.educacion.basica.primaria_concluida == true) {
        await CandidateModel.updateOne(
          { _id: candidate._id },
          {
            $set: {
              educacion_mayor_nivel: "Primaria",
            },
          }
        );
      } else {
        await CandidateModel.updateOne(
          { _id: candidate._id },
          {
            $set: {
              educacion_mayor_nivel: "No registra",
            },
          }
        );
      }
    })
  );
};

console.log("Finished updating candidates education");

updateEducation();
