const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const accountModel = require("../models/account-model")
const utilities = require("../utilities")

/* =========================
 *  HELPERS
 * =======================*/
function getFlashMessage(req) {
  const msg = req.session.message
  req.session.message = null
  return msg
}

/* =========================
 *  REGISTER + LOGIN VIEWS
 * =======================*/

async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: [],                 // no null
    message: getFlashMessage(req),
  })
}

async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],                 // no null
    message: getFlashMessage(req),
  })
}

/* =========================
 *  REGISTER PROCESS
 * =======================*/

async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  try {
    // hash password
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.session.message =
        "Congratulations, you are registered. Please log in."
      return res.redirect("/account/login")
    } else {
      return res.status(500).render("account/register", {
        title: "Register",
        nav,
        errors: [],              // no null
        message: "Sorry, the registration failed.",
      })
    }
  } catch (error) {
    console.error("registerAccount error:", error)
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: [],                // no null
      message: "A server error occurred. Please try again.",
    })
  }
}

/* =========================
 *  LOGIN PROCESS
 * =======================*/

async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [],              // no null
        message: "Please check your credentials and try again.",
      })
    }

    const match = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (!match) {
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [],              // no null
        message: "Please check your credentials and try again.",
      })
    }

    // Build JWT payload
    const payload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    })

    return res.redirect("/account")
  } catch (error) {
    console.error("accountLogin error:", error)
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: [],                // no null
      message: "A server error occurred. Please try again.",
    })
  }
}

/* =========================
 *  ACCOUNT MANAGEMENT VIEW
 * =======================*/

async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
    errors: [],                  // always an array
    message: getFlashMessage(req),
  })
}

/* =========================
 *  UPDATE ACCOUNT VIEW
 * =======================*/

async function buildUpdateAccountView(req, res) {
  const nav = await utilities.getNav()
  const account_id = req.params.account_id
  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData,
    errors: [],                  // always an array
    message: getFlashMessage(req),
  })
}

/* =========================
 *  PROCESS ACCOUNT UPDATE
 * =======================*/

async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body

  try {
    const updatedAccount = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (!updatedAccount) {
      req.session.message = "Sorry, the account was not updated."
      return res.redirect("/account")
    }

    // Refresh JWT with updated info
    const payload = {
      account_id: updatedAccount.account_id,
      account_firstname: updatedAccount.account_firstname,
      account_lastname: updatedAccount.account_lastname,
      account_email: updatedAccount.account_email,
      account_type: updatedAccount.account_type,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    })

    req.session.message = "Account information successfully updated."
    return res.redirect("/account")
  } catch (error) {
    console.error("updateAccount error:", error)
    const nav = await utilities.getNav()
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      accountData: {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      },
      errors: [],                // array here too
      message: "A server error occurred. Please try again.",
    })
  }
}

/* =========================
 *  PROCESS PASSWORD UPDATE
 * =======================*/

async function updatePassword(req, res) {
  const { account_id, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const rowCount = await accountModel.updatePassword(
      account_id,
      hashedPassword
    )

    if (!rowCount) {
      req.session.message = "Sorry, the password was not updated."
      return res.redirect(`/account/update/${account_id}`)
    }

    req.session.message = "Password successfully updated."
    return res.redirect("/account")
  } catch (error) {
    console.error("updatePassword error:", error)
    req.session.message = "A server error occurred. Please try again."
    return res.redirect(`/account/update/${account_id}`)
  }
}

/* =========================
 *  LOGOUT
 * =======================*/

function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.session.message = "You have been logged out."
  res.redirect("/")
}

module.exports = {
  buildRegister,
  buildLogin,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccountView,
  updateAccount,
  updatePassword,
  logoutAccount,
}