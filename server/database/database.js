// const mongoose = require('mongoose')

// const connection = async () => {
//     try{
//         await mongoose.connect(process.env.MONGO)
//         console.log('Car Connected to MongoDB');
//     }catch(err){
//         console.log('Connection Failed',err);
//     }
// }

// module.exports = connection

const mongoose = require("mongoose");

const connection = async () => {
  try {
    const hardcodedMongoURI =
      "mongodb+srv://adeelmirwani222:Adeel222@foodapp.ezapb.mongodb.net/?retryWrites=true&w=majority&appName=Foodapp"; // REPLACE YOUR_ACTUAL_PASSWORD
    console.log("Attempting to connect with hardcoded URI:", hardcodedMongoURI); // For debugging
    await mongoose.connect(hardcodedMongoURI);
    console.log("Car Connected to MongoDB");
  } catch (err) {
    console.log("Connection Failed", err);
  }
};

module.exports = connection;
