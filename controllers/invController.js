const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Inventory management view
 *  (GET /inv)
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const message = res.locals.message

    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      message,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      message: res.locals.message,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Vehicle detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = req.params.invId
    const data = await invModel.getVehicleByInvId(invId)
    const detail = await utilities.buildVehicleDetail(data)
    let nav = await utilities.getNav()

    const title = `${data.inv_make} ${data.inv_model}`

    res.render("./inventory/detail", {
      title,
      nav,
      detail,
      message: res.locals.message,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: res.locals.message,
      classification_name: "",
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Server-side validation for classification
 * ************************** */
invCont.validateClassification = async function (req, res, next) {
  const { classification_name } = req.body
  let message = ""

  if (!classification_name || !classification_name.trim()) {
    message = "Classification name is required."
  } else if (!/^[A-Za-z0-9]+$/.test(classification_name)) {
    message =
      "Classification name may not contain spaces or special characters (letters and numbers only)."
  }

  if (message) {
    let nav = await utilities.getNav()
    return res.status(400).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message,
      classification_name,
    })
  }

  next()
}

/* ***************************
 *  Process add classification POST
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)

    if (result) {
      req.session.message = `Successfully added classification ${result.classification_name}.`
      return res.redirect("/inv")
    } else {
      let nav = await utilities.getNav()
      return res.status(500).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: "Sorry, the classification could not be added.",
        classification_name,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()

    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      message: res.locals.message,
      classificationList,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Server-side validation for inventory
 * ************************** */
invCont.validateInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  const errors = []

  if (!classification_id) errors.push("Please choose a classification.")
  if (!inv_make || !inv_make.trim()) errors.push("Please provide a vehicle make.")
  if (!inv_model || !inv_model.trim()) errors.push("Please provide a vehicle model.")
  if (!inv_description || !inv_description.trim())
    errors.push("Please provide a description.")

  if (!/^\d{4}$/.test(inv_year)) {
    errors.push("Year must be a 4-digit number.")
  }

  const priceNumber = Number(inv_price)
  if (isNaN(priceNumber) || priceNumber <= 0) {
    errors.push("Price must be a positive number.")
  }

  const milesNumber = Number(inv_miles)
  if (!Number.isInteger(milesNumber) || milesNumber < 0) {
    errors.push("Miles must be a whole number, digits only.")
  }

  if (!inv_color || !inv_color.trim()) errors.push("Please provide a color.")
  if (!inv_image || !inv_image.trim()) errors.push("Image path is required.")
  if (!inv_thumbnail || !inv_thumbnail.trim())
    errors.push("Thumbnail image path is required.")

  if (errors.length) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(
      classification_id
    )

    return res.status(400).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      message: errors.join(" "),
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }

  next()
}

/* ***************************
 *  Process add inventory POST
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body

    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      Number(inv_price),
      Number(inv_miles),
      inv_color,
      Number(classification_id)
    )

    if (result) {
      req.session.message = `Successfully added ${inv_year} ${inv_make} ${inv_model}.`
      return res.redirect("/inv")
    } else {
      let nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(
        classification_id
      )
      return res.status(500).render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        message: "Sorry, the vehicle could not be added.",
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  SEARCH: show form
 * ************************** */
invCont.buildSearch = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/search", {
      title: "Search Inventory",
      nav,
      message: res.locals.message,
      term: "",
      resultsGrid: "",
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  SEARCH: process search request
 * ************************** */
invCont.processSearch = async function (req, res, next) {
  try {
    const term = req.body.term ? req.body.term.trim() : ""
    let nav = await utilities.getNav()

    if (!term) {
      return res.status(400).render("./inventory/search", {
        title: "Search Inventory",
        nav,
        message: "Please enter a search term.",
        term,
        resultsGrid: "",
      })
    }

    const results = await invModel.searchInventory(term)

    let resultsGrid = ""
    if (results.length) {
      resultsGrid = await utilities.buildClassificationGrid(results)
    } else {
      resultsGrid =
        '<p class="notice">No vehicles matched your search.</p>'
    }

    res.render("./inventory/search", {
      title: `Search Results for "${term}"`,
      nav,
      message: res.locals.message,
      term,
      resultsGrid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  ALL INVENTORY: /inv/all
 * ************************** */
invCont.buildAllInventory = async function (req, res, next) {
  try {
    const data = await invModel.getAllInventory()
    let nav = await utilities.getNav()
    const grid = await utilities.buildClassificationGrid(data || [])

    res.render("./inventory/all-inventory", {
      title: "All Vehicles",
      nav,
      grid,
      message: res.locals.message,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont
