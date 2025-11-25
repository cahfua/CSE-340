const { Pool } = require("pg")
require("dotenv").config()

// One pool config that works both locally and on Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Helper to log queries (like you had before)
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { text, error: error.message })
      throw error
    }
  },
}