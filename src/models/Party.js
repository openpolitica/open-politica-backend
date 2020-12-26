const mongoose = require("mongoose");

const plansSchema = new mongoose.Schema(
  {
    topic: String,
    plan: String,
  },
  { _id: false }
);

const partySchema = new mongoose.Schema({
  name: String,
  image: String,
  color: String,
  plans: [plansSchema],
});

mongoose.model("Party", partySchema);
