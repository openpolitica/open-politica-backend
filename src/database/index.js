const mongoose = require("mongoose");

const { mongoURI } = require("../config");

if (process.env.NODE_ENV !== "production") mongoose.set("debug", true);

const dbConnection = async function () {
  try {
    // Mongoose connect
    let db = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    console.log("Mongodb is connected to", db.connection.host);
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`);
    setTimeout(connectWithRetry, 5000);
  }
};

/// Retry connection
const connectWithRetry = async () => {
  console.log("MongoDB connection with retry");
  return await dbConnection();
};

module.exports = dbConnection;
