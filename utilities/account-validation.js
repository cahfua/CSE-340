const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

/* =========================================
 *  REGISTRATION RULES
 * =======================================*/
const registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email address is required.")
      .custom(async (account_email) => {
        const existing = await accountModel.getAccountByEmail(account_email)
        if (existing) {
          throw new Error("That email address is already registered.")
        }
        return true
      }),
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 8 characters and include upper, lower, number and special character."
      ),
  ]
}

async function checkRegData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await require("../utilities").getNav()
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      message: null,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

/* =========================================
 *  LOGIN RULES
 * =======================================*/
const loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email address is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

async function checkLoginData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await require("../utilities").getNav()
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      message: null,
    })
  }
  next()
}

/* =========================================
 *  ACCOUNT UPDATE RULES
 * =======================================*/
function accountUpdateRules() {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const existing = await accountModel.getAccountById(account_id)
        if (!existing) return true

        if (existing.account_email === account_email) return true

        const other = await accountModel.getAccountByEmail(account_email)
        if (other) {
          throw new Error("That email address is already in use.")
        }
        return true
      }),
    body("account_id")
      .notEmpty()
      .withMessage("Account id is required."),
  ]
}

async function checkAccountUpdateData(req, res, next) {
  const errors = validationResult(req)
  const accountData = {
    account_id: req.body.account_id,
    account_firstname: req.body.account_firstname,
    account_lastname: req.body.account_lastname,
    account_email: req.body.account_email,
  }

  if (!errors.isEmpty()) {
    const nav = await require("../utilities").getNav()
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      message: null,
      accountData,
    })
  }
  next()
}

/* =========================================
 *  PASSWORD UPDATE RULES
 * =======================================*/
function passwordUpdateRules() {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 8 characters and include upper, lower, number and special character."
      ),
    body("account_id")
      .notEmpty()
      .withMessage("Account id is required."),
  ]
}

async function checkPasswordUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await require("../utilities").getNav()
    const accountData = await accountModel.getAccountById(req.body.account_id)
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      message: null,
      accountData,
    })
  }
  next()
}

/* =========================================
 *  EXPORTS
 * =======================================*/
module.exports = {
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData,
  accountUpdateRules,
  checkAccountUpdateData,
  passwordUpdateRules,
  checkPasswordUpdateData,
}