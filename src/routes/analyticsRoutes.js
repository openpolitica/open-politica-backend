const express = require("express");
const mongoose = require("mongoose");

const Party = mongoose.model("Party");

const router = express.Router();

router.get("/parties", async (req, res) => {
  const parties = await Party.find().sort({
    name: "asc",
  });
  res.send(parties);
});

router.get("/parties/:id", async (req, res) => {
  const party = await Party.findOne({ _id: req.params.id });
  res.send(party);
});

router.post("/parties", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(422).send({ error: "You must provide a name" });
  }

  try {
    const party = new Party(req.body);
    await party.save();

    res.send(party);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.put("/parties/:id", async (req, res) => {
  const party = await Party.findOne({ _id: req.params.id });
  Object.assign(party, req.body);
  await party.save();
  res.send("modified");
});

router.delete("/parties/:id", async (req, res) => {
  await Party.deleteOne({ _id: req.params.id });
  res.send("success");
});

module.exports = router;
