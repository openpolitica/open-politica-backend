const express = require("express");
const partiesController = require("../controllers/partiesController");

const router = express.Router();

router.get("/", partiesController.getParties);

router.get("/:id", partiesController.findOneParty);

router.post("/", partiesController.createParty);

router.put("/:id", partiesController.modifyOneParty);

router.delete("/:id", partiesController.deleteOneParty);

module.exports = router;
