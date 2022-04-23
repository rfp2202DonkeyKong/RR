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

const getMetaReviews = async (productId) => {
  try {
    let client = await pool.connect();
    await client.query(`CREATE TABLE current_product AS SELECT * FROM reviews WHERE product_id = ${productId}`);
    let results = await client.query(
      `SELECT
        characteristicreviews.id AS id,
        current_product.id AS review_id,
        characteristicreviews.characteristic_id AS char_id,
        rating,
        recommend,
        name,
        value
      FROM current_product
      INNER JOIN characteristicreviews ON current_product.id = characteristicreviews.review_id
      INNER JOIN characteristics ON characteristicreviews.characteristic_id = characteristics.id;`);
      client.query(`DROP TABLE current_product`);
      client.release();
      return results.rows;
  } catch(err) {
    console.log(`Error found in getMetaReviews: ${err}`)
  }
}

const reportReview = async (review_id) => {
  try {
    let client = await pool.connect();
    await client.query(`UPDATE reviews SET reported = true WHERE reviews.id = ${review_id}`)
    client.release();
  } catch(err) {
    console.log(`Error found in reportReview: ${err}`);
  }
};

const addHelpfulReview = async (review_id) => {
  try {
    let client = await pool.connect();
    await client.query(`UPDATE reviews SET helpfulness = helpfulness + 1 WHERE reviews.id = ${review_id}`)
    client.release();
  } catch(err) {
    console.log(`Error found in addHelpfulReview: ${err}`);
  }
};

const postReview = async (post) => {
  let date = Date.now()
  try {
    let client = await pool.connect();
    await client.query(`INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES (${post.product_id}, ${post.rating}, ${date}, ${post.summary}, ${post.body}, ${post.recommend}, false, ${post.name}, ${post.email}, ${post.photos}, ${post.characteristics})`);
    client.release();
  } catch(err) {
    console.log(`Error found in postReview: ${err}`);
  }
};

module.exports.getReviews = getReviews;
module.exports.getMetaReviews = getMetaReviews;
module.exports.reportReview = reportReview;
module.exports.addHelpfulReview = addHelpfulReview;
module.exports.postReview = postReview;

