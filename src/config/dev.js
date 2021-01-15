if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  mongoURI: process.env.MONGO_URI || "localhost:27001"
};
