const { Pool } = require('pg');
const Promise = require('bluebird');
// let db = Promise.promisifyAll(pg);


const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "",
  database: "ratings"
})

const getReviews = async (productId, sort) => {
  try {
    let client = await pool.connect();
    await client.query(`CREATE TABLE current_product AS SELECT * FROM reviews WHERE product_id = ${productId}`);
    let results = await client.query(
    `SELECT
      current_product.id AS review_id,
      reviewsphotos.id AS photo_id,
      rating,
      date,
      summary,
      body,
      recommend,
      reviewer_name,
      reviewer_email,
      response,
      helpfulness,
      url
    FROM current_product LEFT JOIN reviewsphotos ON reviewsphotos.review_id = current_product.id ORDER BY ${sort}`);
    client.query(`DROP TABLE current_product`);
    client.release();
    return results.rows;
  } catch(err) {
    console.log(`Error found in getReviews: ${err}`);
  }
}

const getMetaReviews = (productId) => {
  try {

  } catch(err) {
    console.log(`Error found in getMetaReviews: ${err}`)
  }
}

module.exports.getReviews = getReviews;
module.exports.getMetaReviews = getMetaReviews;

