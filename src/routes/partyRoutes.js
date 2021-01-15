const express = require("express");
const partiesController = require("../controllers/partiesController");

const router = express.Router();

router.get("/", partiesController.getParties);

router.get("/:id", partiesController.findOneParty);

module.exports = router;
