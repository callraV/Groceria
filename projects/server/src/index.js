const { join } = require("path");
require("dotenv").config({ path: join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const { adminAuthRoutes, authRoutes} = require("./routes");


require("./config/db.js");

// const PORT = process.env.PORT || 8000;
const PORT = 8000;
const app = express();
app.use(cors());

app.use(express.json());
app.use("/", express.static(__dirname + "/public"));

//#region API ROUTES
app.get("/api", (req, res) => {
  res.send(`Hello, this is my API`);
});

app.get("/api/greetings", (req, res, next) => {
  res.status(200).json({
    message: "Hello, Student !",
  });
});
// ===========================
// NOTE : Add your routes here

app.use("/api/auth", authRoutes);
app.use('/api/admin', adminAuthRoutes);

// ===========================

// not found
app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found !");
  } else {
    next();
  }
});

// error
app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err);
    res.status(err.status_code).send(err.message);
  } else {
    next();
  }
});

//#endregion

//#region CLIENT
const clientPath = "../../client/build";
app.use(express.static(join(__dirname, clientPath)));

// Serve the HTML page
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, clientPath, "index.html"));
});

//#endregion

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});
