const express = require("express");
const partiesController = require("../controllers/partiesController");

const router = express.Router();

router.get("/dirtylists", partiesController.getDirtyLists);

router.get("/presidential_lists", partiesController.getParties);

router.get("/:id", partiesController.findOneParty);

router.get("/presidential_lists/:party", partiesController.getPartyLeaders);

module.exports = router;
