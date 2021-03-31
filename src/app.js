const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const rateLimiter = require("./middlewares/rateLimiter");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Express Middleware
const app = express();

app.use(cors());
app.use(rateLimiter);
app.use(express.json());
app.use("/", routes);

module.exports = app;
