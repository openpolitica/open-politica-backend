require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const csv = require("csv-parser");
const fs = require("fs");
const results = [];

fs.createReadStream("experiencia_candidate_level.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    await Promise.all(
      results.map(async (element) => {
        await CandidateModel.updateOne(
          {
            hoja_vida_id: element.hoja_vida_id,
          },
          {
            $set: {
              experiencia_publica: element.public === "1" ? true : false,
            },
          }
        );
      })
    );
  });
