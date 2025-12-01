const pool = require("../database")

/* =========================
 *  BASIC ACCOUNT QUERIES
 * =======================*/

// Check if email already exists
async function checkExistingEmail(account_email) {
  const sql = "SELECT account_id FROM account WHERE account_email = $1"
  const data = await pool.query(sql, [account_email])
  return data.rowCount
}

// Register a new account
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  const sql = `
    INSERT INTO account (
      account_firstname,
      account_lastname,
      account_email,
      account_password
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `
  const data = await pool.query(sql, [
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  ])
  return data.rows[0]
}

// Get account by email
async function getAccountByEmail(account_email) {
  const sql = "SELECT * FROM account WHERE account_email = $1"
  const data = await pool.query(sql, [account_email])
  return data.rows[0]
}

/* =========================
 *  UPDATE SUPPORT (W05)
 * =======================*/

// Get account by account_id
async function getAccountById(account_id) {
  const sql = "SELECT * FROM account WHERE account_id = $1"
  const data = await pool.query(sql, [account_id])
  return data.rows[0]
}

// Update firstname, lastname, email
async function updateAccount(account_id, firstname, lastname, email) {
  const sql = `
    UPDATE account
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4
    RETURNING *
  `
  const data = await pool.query(sql, [firstname, lastname, email, account_id])
  return data.rows[0]
}

// Update password hash
async function updatePassword(account_id, hashedPassword) {
  const sql = `
    UPDATE account
    SET account_password = $1
    WHERE account_id = $2
  `
  const data = await pool.query(sql, [hashedPassword, account_id])
  return data.rowCount
}

module.exports = {
  checkExistingEmail,
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
}
