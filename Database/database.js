const { Pool, Client } = require('pg');
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
    await client.query(`DROP TABLE IF EXISTS current_product${productId}`);
    await client.query(`CREATE TABLE current_product${productId} AS SELECT * FROM reviews WHERE reviews.product_id = ${productId}`);
    let results = await client.query(
    `SELECT
      current_product${productId}.id AS review_id,
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
    FROM current_product${productId} LEFT JOIN reviewsphotos ON reviewsphotos.review_id = current_product${productId}.id ORDER BY ${sort}`);
    // await client.query(`DROP TABLE current_product`);
    await client.release();
    return results.rows;
  } catch(err) {
    console.log(`Error found in getReviews: ${err}`);
  }
}

const getMetaReviews = async (productId) => {
  try {
    let client = await pool.connect();
    await client.query(`DROP TABLE IF EXISTS current_product${productId}`);
    await client.query(`CREATE TABLE current_product${productId} AS SELECT * FROM reviews WHERE product_id = ${productId}`);
    let results = await client.query(
      `SELECT
        characteristicreviews.id AS id,
        current_product${productId}.id AS review_id,
        characteristicreviews.characteristic_id AS char_id,
        rating,
        recommend,
        name,
        value
      FROM current_product${productId}
      INNER JOIN characteristicreviews ON current_product${productId}.id = characteristicreviews.review_id
      INNER JOIN characteristics ON characteristicreviews.characteristic_id = characteristics.id;`);
      // await client.query(`DROP TABLE current_product`);
      await client.release();
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
    let reviewId = await client.query(`INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES (${post.product_id}, ${post.rating}, ${date}, '${post.summary}', '${post.body}', ${post.recommend}, false, '${post.name}', '${post.email}', NULL, 0) RETURNING id`);
    if (post.photos.length) {
      for (var i = 0; i < post.photos.length; i++) {
        await client.query(`INSERT INTO reviewsphotos (review_id, url) VALUES (${reviewId.rows[0].id}, '${post.photos[i]}')`);
      }
    }
    if (Object.keys(post.characteristics).length) {
      let chars = await client.query(`SELECT name FROM characteristics WHERE characteristics.product_id = ${post.product_id}`);
      let charsArr = [];
      for (var j = 0; j < chars.rows.length; j++) {
        charsArr.push(chars.rows[j].name);
      }
      for (var characteristic in post.characteristics) {
        if (!charsArr.includes(characteristic)) {
          var charId = await client.query(`INSERT INTO characteristics (product_id, name) VALUES (${post.product_id}, '${characteristic}') RETURNING id`);
          await client.query(`INSERT INTO characteristicreviews (characteristic_id, review_id, value) VALUES (${charId.rows[0].id}, ${reviewId.rows[0].id}, ${post.characteristics[characteristic]})`)
        }
      }
    }
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

