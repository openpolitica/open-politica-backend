require("dotenv").config({ path: "../../.env" });
require("../database")();

const { CandidateModel } = require("../models");

const csv = require("csv-parser");
const fs = require("fs");
const results = [];

console.log("Updating candidates with experience");
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

// fill the blanks
const updateCandidates = async () => {
  console.log("Updating candidates with no experience");
  const candidates = await CandidateModel.find({});
  await Promise.all(
    candidates.map(async (candidateElement) => {
      await CandidateModel.updateMany(
        { experiencia_publica: null },
        {
          $set: {
            experiencia_publica: false,
          },
        }
      );
    })
  );
  console.log("Finished updating candidates with no experience");
};

updateCandidates();
