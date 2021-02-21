const db = require("../database");

const getLocations = async () => {
  let query = "SELECT location FROM locations ORDER BY location ASC";

  try {
    locations = await db.query(query);
    return locations.map((e) => {
      return e.location;
    });
  } catch (error) {
    throw new Error("Error al consultar las ubicaciones");
  }
};

const getLocationSeats = async (location) => {
  let query = "SELECT seats FROM locations WHERE location = ?";

  try {
    seats = await db.query(query, location);
    return seats[0];
  } catch (error) {
    throw new Error("Error al consultar los escaños");
  }
};

module.exports = {
  getLocations,
  getLocationSeats,
};
