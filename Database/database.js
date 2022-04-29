const { Pool, Client } = require('pg');

const pool = new Pool({
  host: "54.151.20.225",
  user: "ubuntu",
  port: 5432,
  password: 'password',
  database: "ratingsReviews"
})
// const pool = new Pool({
//   host: "localhost",
//   user: "postgres",
//   port: 5432,
//   password: 'password',
//   database: "ratingsReviews"
// })

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log(result.rows);
  });
});

const randomNumber = () => {
  return Math.floor(Math.random() * (999999999 - 0) + 0);
}

const getReviews = async (productId, sort) => {
  try {
    const client = await pool.connect();
    let randomId = randomNumber();
    let results = await client.query(
    `SELECT
      reviews.id AS review_id,
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
    FROM reviews
    LEFT JOIN reviewsphotos ON reviewsphotos.review_id = reviews.id
    WHERE reviews.product_id = ${productId}
    ORDER BY ${sort}`);
    await client.release();
    return results.rows;
  } catch(err) {
    console.log(`Error found in getReviews: ${err}`);
  }
}

const getMetaReviews = async (productId) => {
  try {
    const client = await pool.connect()
    let randomId = randomNumber();
    let results = await client.query(
      `SELECT
        characteristicreviews.id AS id,
        reviews.id AS review_id,
        characteristicreviews.characteristic_id AS char_id,
        rating,
        recommend,
        name,
        value
      FROM reviews
      INNER JOIN characteristicreviews ON reviews.id = characteristicreviews.review_id
      INNER JOIN characteristics ON characteristicreviews.characteristic_id = characteristics.id
      WHERE ${productId} = reviews.product_id`);
      await client.release()
      return results.rows;
  } catch(err) {
    console.log(`Error found in getMetaReviews: ${err}`)
  }
}

const reportReview = async (review_id) => {
  try {
    await pool.query(`UPDATE reviews SET reported = true WHERE reviews.id = ${review_id}`)
  } catch(err) {
    console.log(`Error found in reportReview: ${err}`);
  }
};

const addHelpfulReview = async (review_id) => {
  try {
    await pool.query(`UPDATE reviews SET helpfulness = helpfulness + 1 WHERE reviews.id = ${review_id}`)
  } catch(err) {
    console.log(`Error found in addHelpfulReview: ${err}`);
  }
};

const postReview = async (post) => {
  let date = Date.now()
  try {
    let reviewId = await pool.query(`INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES (${post.product_id}, ${post.rating}, ${date}, '${post.summary}', '${post.body}', ${post.recommend}, false, '${post.name}', '${post.email}', NULL, 0) RETURNING id`);
    if (post.photos.length) {
      for (var i = 0; i < post.photos.length; i++) {
        await pool.query(`INSERT INTO reviewsphotos (review_id, url) VALUES (${reviewId.rows[0].id}, '${post.photos[i]}')`);
      }
    }
    if (Object.keys(post.characteristics).length) {
      let chars = await pool.query(`SELECT name FROM characteristics WHERE characteristics.product_id = ${post.product_id}`);
      let charsArr = [];
      for (var j = 0; j < chars.rows.length; j++) {
        charsArr.push(chars.rows[j].name);
      }
      for (var characteristic in post.characteristics) {
        if (!charsArr.includes(characteristic)) {
          var charId = await pool.query(`INSERT INTO characteristics (product_id, name) VALUES (${post.product_id}, '${characteristic}') RETURNING id`);
          await pool.query(`INSERT INTO characteristicreviews (characteristic_id, review_id, value) VALUES (${charId.rows[0].id}, ${reviewId.rows[0].id}, ${post.characteristics[characteristic]})`)
        }
      }
    }
  } catch(err) {
    console.log(`Error found in postReview: ${err}`);
  }
};

module.exports.getReviews = getReviews;
module.exports.getMetaReviews = getMetaReviews;
module.exports.reportReview = reportReview;
module.exports.addHelpfulReview = addHelpfulReview;
module.exports.postReview = postReview;

