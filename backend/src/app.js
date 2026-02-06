const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./utils/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Mini Document Manager API is running");
});

const testRoutes = require("./routes/test.routes");
app.use("/api", testRoutes);


module.exports = app;
