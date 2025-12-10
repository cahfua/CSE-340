/* ******************************************
 * This is the application server
 * ******************************************/
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const fs = require("fs");
const session = require("express-session")

const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errorRoute")
const cookieParser = require("cookie-parser")


/* ******************************************
 * View Engine and Templates
 * ***************************************** */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 
app.use(expressLayouts);
app.set("layout", path.join(__dirname, "views/layouts/layout"))

const publicPath = path.join(__dirname, "public")
app.use(express.static(publicPath))

app.use(express.urlencoded({ extended: true }))

app.use(express.json())
app.use(cookieParser())

const utilities = require("./utilities")
app.use(utilities.checkJWTToken)


/* ******************************************
 * Session Middleware (Flash Messages)
 * ******************************************/
app.use(
  session({
    secret: process.env.SESSION_SECRET || "superSecretSession",
    resave: false,
    saveUninitialized: true,
  })
)

app.use((req, res, next) => {
  res.locals.message = req.session.message
  delete req.session.message
  next()
})

/* ******************************************
 * Default GET route
 * ***************************************** */
// Index route  ← # added this per assignment
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

app.use("/error", errorRoute)

app.get("/welcome", (req, res) => {
  res.send("Welcome home!")
})

const accountRoute = require("./routes/accountRoute")
app.use("/account", accountRoute)


/* ******************************************
 * 404 Handler
 * ******************************************/
app.use(async (req, res, next) => {
  const utilities = require("./utilities")
  let nav = await utilities.getNav()
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "The page you requested was not found.",
    nav,
  })
})

/* ******************************************
 * 500 Handler
 * ******************************************/
app.use(async (err, req, res, next) => {
  console.error("SERVER ERROR:", err)
  const utilities = require("./utilities")
  let nav = await utilities.getNav()
  res.status(err.status || 500).render("errors/error", {
    title: "Server Error",
    message: err.message || "Something went wrong.",
    nav,
  })
})

/* ******************************************
 * Server host name and port
 * ***************************************** */
const PORT = process.env.PORT || 5500
const HOST = "0.0.0.0"

app.listen(PORT, HOST, () => {
  console.log(`app listening on ${HOST}:${PORT}`)
})

console.log("Views dir:", app.get("views"))
console.log(
  "index.ejs exists:",
  fs.existsSync(path.join(app.get("views"), "index.ejs"))
)