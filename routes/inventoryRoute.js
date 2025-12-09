const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// =======================
//  ADMIN / EMPLOYEE ONLY
// =======================

// management view (Vehicle Management page)
router.get(
  "/",
  utilities.checkAccountType,
  invController.buildManagementView
)

// add classification form
router.get(
  "/add-classification",
  utilities.checkAccountType,
  invController.buildAddClassification
)

// process new classification
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invController.validateClassification,
  invController.addClassification
)

// add vehicle form
router.get(
  "/add-vehicle",
  utilities.checkAccountType,
  invController.buildAddInventory
)

// process new vehicle
router.post(
  "/add-vehicle",
  utilities.checkAccountType,
  invController.validateInventory,
  invController.addInventory
)

// search form (admin / employee only)
router.get(
  "/search",
  utilities.checkAccountType,
  invController.buildSearch
)

// search submission
router.post(
  "/search",
  utilities.checkAccountType,
  invController.processSearch
)

// =======================
//  PUBLIC ROUTES
// =======================

// all inventory (public)
router.get("/all", invController.buildAllInventory)

// build inventory by classification view (public)
router.get("/type/:classificationId", invController.buildByClassificationId)

// build inventory detail view (public)
router.get("/detail/:invId", invController.buildByInvId)

module.exports = router
