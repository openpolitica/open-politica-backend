const express = require("express");
const policiesController = require("../controllers/policiesController");

const router = express.Router();

router.get("/topics", policiesController.getTopics);

router.get("/questions", policiesController.getQuestions);

router.post("/results", policiesController.getPolicyResults);

module.exports = router;
