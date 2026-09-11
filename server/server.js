// const express = require('express');
// const connection  = require('./database/database');
// const dotenv = require('dotenv')
// const userRoutes = require('./routes/userRoutes')
// const brandRoutes = require('./routes/brandRoutes')
// const carRoutes = require('./routes/carRoutes')
// const cors = require('cors')
// const app = express();

// app.use(cors());

// app.use(express.json())
// dotenv.config()

// connection();

// app.use(express.static('uploads/'));

// app.use('/api/user',userRoutes);
// app.use('/api/brand',brandRoutes);
// app.use('/api/car',carRoutes);

// app.listen(process.env.PORT,() => {
//     console.log('Car Running on port 5000');
// })
// server/server.js
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables FIRST!
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Now you can import/require other modules that depend on env variables
const connection = require("./database/database");
const userRoutes = require("./routes/userRoutes");
const brandRoutes = require("./routes/brandRoutes");
const carRoutes = require("./routes/carRoutes");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Your database connection can now use process.env variables if needed
connection();

app.use(express.static("uploads/"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/user", userRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/car", carRoutes);

app.listen(process.env.PORT, () => {
  console.log("Car Running on port 5000");
});
