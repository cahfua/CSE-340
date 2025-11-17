/* ******************************************
 * This is the application server
 * ******************************************/
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const fs = require("fs");
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")

/* ******************************************
 * View Engine and Templates
 * ***************************************** */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 
app.use(expressLayouts);
app.set("layout", path.join(__dirname, "views/layouts/layout"))

app.use(express.static("public"))

/* ******************************************
 * Default GET route
 * ***************************************** */
// Index route  ← # added this per assignment
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

app.get("/welcome", (req, res) => {
  res.send("Welcome home!")
})

/* ******************************************
 * Server host name and port
 * ***************************************** */
const PORT = process.env.PORT || 5500;
const HOST = "0.0.0.0";

/* ***********************
 * Log statement to confirm server operation
 * *********************** */
app.listen(PORT, HOST, () => {
  console.log(`app listening on ${HOST}:${PORT}`)
})

console.log("Views dir:", app.get("views"));
console.log("index.ejs exists:", fs.existsSync(path.join(app.get("views"), "index.ejs")));