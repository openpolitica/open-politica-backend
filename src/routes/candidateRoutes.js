const express = require("express");
const router = express.Router();

const candidatesController = require("../controllers/candidatesController");

router.get("/", candidatesController.getCandidates);

router.get(
  "/hoja_vida_id/:hoja_vida_id",
  candidatesController.getCandidateByHojaDeVida
);

router.get("/id_dni/:id_dni", candidatesController.getCandidateByDNI);

router.get("/:id", candidatesController.getCandidateById);

module.exports = router;
