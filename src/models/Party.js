const { Schema, model } = require("mongoose");

const plansSchema = new Schema(
  {
    topic: String,
    plan: String
  },
  { _id: false }
);

const partySchema = new Schema({
  name: String,
  image: String,
  color: String,
  plans: [plansSchema]
});

module.exports = model("Party", partySchema);
