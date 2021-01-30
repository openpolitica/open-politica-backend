const express = require("express");
const router = express.Router();
const db = require("../database");
const swaggerUi = require("swagger-ui-express");

// Main route
router.get("/", async (req, res) => {
  const result = await db.query("SELECT 1+1 AS RESULT");
  console.log(result);
  res.send("Server and DB running OK");
});

// Swagger
const swaggerDocument = require("../swagger.json");
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.use("/parties", require("./partyRoutes"));
router.use("/candidates", require("./candidateRoutes"));

module.exports = router;
