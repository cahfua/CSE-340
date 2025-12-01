const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const validate = require("../utilities/account-validation")

/* =========================
 *  AUTH ROUTES
 * =======================*/

// Show registration form
router.get("/register", accountController.buildRegister)

// Process registration
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  accountController.registerAccount
)

// Show login form
router.get("/login", accountController.buildLogin)

// Process login
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  accountController.accountLogin
)

/* =========================
 *  ACCOUNT MANAGEMENT
 * =======================*/

// Account management home
router.get(
  "/",
  utilities.checkLogin,
  accountController.buildAccountManagement
)

// Update account view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  accountController.buildUpdateAccountView
)

// Process account update (name, email)
router.post(
  "/update",
  utilities.checkLogin,
  validate.accountUpdateRules(),
  validate.checkAccountUpdateData,
  accountController.updateAccount
)

// Process password update
router.post(
  "/update-password",
  utilities.checkLogin,
  validate.passwordUpdateRules(),
  validate.checkPasswordUpdateData,
  accountController.updatePassword
)

// Logout
router.get("/logout", utilities.checkLogin, accountController.logoutAccount)

module.exports = router