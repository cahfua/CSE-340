const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  const data = await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  )
  return data.rows
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
    throw error
  }
}

/* ***************************
 *  Get vehicle by inv_id
 * ************************** */
async function getVehicleByInvId(inv_id) {
  try {
    const sql = `
      SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleByInvId error: " + error)
    throw error
  }
}

/* ***************************
 *  New classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING classification_id, classification_name
    `
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("addClassification error: " + error)
    return null
  }
}

/* ***************************
 *  New inventory item
 * ************************** */
async function addInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles,
        inv_color, classification_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING inv_id
    `
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    ])
    return data.rows[0]
  } catch (error) {
    console.error("addInventory error: " + error)
    return null
  }
}

/* ***************************
 *  SEARCH inventory by term
 *  (make, model, description, or classification name)
 * ************************** */
async function searchInventory(term) {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
      WHERE i.inv_make ILIKE $1
         OR i.inv_model ILIKE $1
         OR i.inv_description ILIKE $1
         OR c.classification_name ILIKE $1
      ORDER BY i.inv_make, i.inv_model
    `
    const data = await pool.query(sql, [`%${term}%`])
    return data.rows
  } catch (error) {
    console.error("searchInventory error: " + error)
    throw error
  }
}

/* ***************************
 *  Get all inventory
 *  shows every car in the inventory as a grid
 * ************************** */
async function getAllInventory() {
  try {
    const sql = `
      SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
      ORDER BY i.inv_make, i.inv_model
    `
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getAllInventory error:", error)
    return null
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleByInvId,
  addClassification,
  addInventory,
  searchInventory,
  getAllInventory,
}