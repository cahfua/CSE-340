const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
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
      grid
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build vehicle detail view
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
      detail
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont