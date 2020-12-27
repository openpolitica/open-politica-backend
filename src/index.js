require("./models/Candidate");
require("./models/Party");
const os = require("os");
const http = require("http");
const cluster = require("cluster");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const candidateRoutes = require("./routes/candidateRoutes");
const partyRoutes = require("./routes/partyRoutes");

const numCPUs = os.cpus().length;
// const clusterEnabled = process.env["CLUSTERING_ENABLED"] || false;

// Mongoose connect
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.connection.on("connected", () => {
  console.log("connected to MongoDB");
});

/// Retry connection
const connectWithRetry = () => {
  console.log("MongoDB connection with retry");
  return mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};

/// Exit application on error
mongoose.connection.on("error", (err) => {
  console.log(`MongoDB connection error: ${err}`);
  setTimeout(connectWithRetry, 5000);
  // process.exit(-1)
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", function() {
  mongoose.connection.close(function() {
    console.log(
      "Mongoose default connection disconnected through app      termination"
    );
    process.exit(0);
  });
});

// Cluster
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork(); // Create a New Worker, If Worker is Dead
  });
} else {
  // Express Middleware
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(candidateRoutes);
  app.use(partyRoutes);

  // Main routes
  app.get("/", (req, res) => {
    res.send("Hi there! " + cluster.worker.id);
  });

  // Swagger
  const swaggerDocument = require("./swagger.json");
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Server
  http.createServer(app).listen(process.env.PORT || 3000, function() {
    console.log(
      "Express server listening on port 3000 as Worker " +
        cluster.worker.id +
        " running @ process " +
        cluster.worker.process.pid +
        "!"
    );
  });
}
