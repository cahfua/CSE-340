const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// management view
router.get("/", invController.buildManagementView)

// build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// build inventory detail view
router.get("/detail/:invId", invController.buildByInvId)

// adding a new classification
router.get("/add-classification", invController.buildAddClassification)
router.post(
  "/add-classification",
  invController.validateClassification,
  invController.addClassification
)

// adding a new vehicle
router.get("/add-vehicle", invController.buildAddInventory)
router.post(
  "/add-vehicle",
  invController.validateInventory,
  invController.addInventory
)

module.exports = router
