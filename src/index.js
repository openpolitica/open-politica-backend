if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
require("./models/Candidate");
require("./models/Party");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const mongoose = require("mongoose");
const candidateRoutes = require("./routes/candidateRoutes");
const partyRoutes = require("./routes/partyRoutes");

// Mongoose connect
const mongooseConnect = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};
mongooseConnect();

mongoose.connection.on("connected", () => {
  console.log("connected to MongoDB");
});

/// Retry connection
const connectWithRetry = () => {
  console.log("MongoDB connection with retry");
  return mongooseConnect();
};

/// Exit application on error
mongoose.connection.on("error", (err) => {
  console.log(`MongoDB connection error: ${err}`);
  setTimeout(connectWithRetry, 5000);
});

// Express Middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(candidateRoutes);
app.use(partyRoutes);

// Main route
app.get("/", (req, res) => {
  res.send("Server running OK");
});

// Swagger
const swaggerDocument = require("./swagger.json");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Server
app.listen(process.env.PORT || 3000);
