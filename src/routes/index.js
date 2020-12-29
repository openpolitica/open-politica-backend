const express = require("express");
const router = express.Router();
const swaggerUi = require("swagger-ui-express");

// Main route
router.get("/", (req, res) => {
  res.send("Server running OK");
});

// Swagger
const swaggerDocument = require("../swagger.json");
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.use("/parties", require("./partyRoutes"));
router.use("/candidates", require("./candidateRoutes"));

module.exports = router;
