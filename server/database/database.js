const mongoose = require("mongoose");

const connection = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO;

  if (!mongoUri) {
    console.error(
      "Connection Failed: MONGO_URI or MONGO is not set in server/.env"
    );
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Car Connected to MongoDB");
  } catch (err) {
    console.log("Connection Failed", err);
  }
};

module.exports = connection;
