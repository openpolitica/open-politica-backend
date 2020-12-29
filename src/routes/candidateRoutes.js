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

router.post("/", candidatesController.createCandidate);

router.put("/:id", candidatesController.modifyCandidateById);

router.delete("/:id", candidatesController.deleteCandidate);

module.exports = router;
