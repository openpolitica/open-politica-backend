require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const resetCandidates = async () => {
  console.log("Resetting candidates");
  const candidates = await CandidateModel.updateMany(
    {},
    {
      sentencias_ec: [],
      sentencias_ec_penal_cnt: 0,
      sentencias_ec_civil_cnt: 0,
    }
  );
};

resetCandidates();

const csv = require("csv-parser");
const fs = require("fs");
const results = [];

fs.createReadStream("sentencias_input_data.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    await Promise.all(
      results.map(async (element) => {
        let sentencia = {
          delito: element.delito,
          procesos: parseInt(element.procesos),
          tipo: element.tipo,
          fallo: element.fallo,
        };
        await CandidateModel.updateOne(
          {
            hoja_vida_id: element.hoja_vida_id,
          },
          {
            $push: { sentencias_ec: sentencia },
            $inc: {
              sentencias_ec_civil_cnt: sentencia.tipo === "Civil" ? 1 : 0,
              sentencias_ec_penal_cnt: sentencia.tipo === "Penal" ? 1 : 0,
            },
          }
        );
      })
    );
  });
