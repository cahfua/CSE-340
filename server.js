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

const errorRoute = require("./routes/errorRoute")
app.use("/error", errorRoute)

/* ******************************************
 * 404 Error Handler - Keep this above the 500 handler
 * ***************************************** */
app.use(async (req, res, next) => {
  const utilities = require("./utilities")
  let nav = await utilities.getNav()
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "The page you requested was not found.",
    nav
  })
})

/* ******************************************
 * 500 Error Handler - Must be last
 * ***************************************** */
app.use(async (err, req, res, next) => {
  console.error("SERVER ERROR:", err)
  const utilities = require("./utilities")
  let nav = await utilities.getNav()

  res.status(err.status || 500).render("errors/error", {
    title: "Server Error",
    message: err.message || "Something went wrong.",
    nav
  })
})


/* ***********************
 * Log statement to confirm server operation
 * *********************** */
app.listen(PORT, HOST, () => {
  console.log(`app listening on ${HOST}:${PORT}`)
})

console.log("Views dir:", app.get("views"));
console.log("index.ejs exists:", fs.existsSync(path.join(app.get("views"), "index.ejs")));