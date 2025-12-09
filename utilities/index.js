const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  list += '<li><a href="/inv/all">All Vehicles</a></li>'
  data.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid =
      '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build vehicle detail HTML
 * ************************************ */
Util.buildVehicleDetail = function (data) {
  let detail = `
    <section class="vehicle-detail">
      <img class="vehicle-img" src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
      
      <div class="vehicle-info">
        <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>

        <p class="price">Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</p>

        <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</p>
        <p><strong>Color:</strong> ${data.inv_color}</p>
        <p><strong>Description:</strong> ${data.inv_description}</p>
      </div>
    </section>
  `
  return detail
}

/* **************************************
 * Build classification <select> for forms
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected"
    }
    classificationList += ">" + row.classification_name + "</option>"
  })

  classificationList += "</select>"
  return classificationList
}

/* ============ AUTH HELPERS ============ */

function checkJWTToken(req, res, next) {
  const token = req.cookies?.jwt
  if (!token) {
    res.locals.loggedin = false
    return next()
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, accountData) => {
    if (err) {
      res.clearCookie("jwt")
      res.locals.loggedin = false
      return next()
    }
    res.locals.loggedin = true
    res.locals.accountData = accountData
    next()
  })
}

function checkLogin(req, res, next) {
  if (!res.locals.loggedin) {
    req.session.message = "Please log in to continue."
    return res.redirect("/account/login")
  }
  next()
}

function checkAccountType(req, res, next) {
  const type = res.locals.accountData?.account_type
  if (type === "Employee" || type === "Admin") {
    return next()
  }
  req.session.message = "You do not have permission to access that area."
  return res.redirect("/account/login")
}

/* ========= WHAT OTHER FILES IMPORT ========= */

module.exports = {
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildVehicleDetail: Util.buildVehicleDetail,
  buildClassificationList: Util.buildClassificationList,
  checkJWTToken,
  checkLogin,
  checkAccountType,
}