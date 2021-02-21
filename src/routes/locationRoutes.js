const express = require("express");
const router = express.Router();

const locationsController = require("../controllers/locationsController");

router.get("/", locationsController.getLocations);

router.get("/:location/seats", locationsController.getLocationSeats);

module.exports = router;
