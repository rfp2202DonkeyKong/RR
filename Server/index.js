const {getReviews} = require('../Database/database.js');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

//works
app.get('/reviews/meta', (req, res) => {
  console.log(req.query.product_id)
  res.send('this is the meta response');
})

//works
app.get('/reviews', async (req, res) => {
  let sort = req.query.sort;
  if (sort === 'helpful') {
    console.log('why you no work')
    sort = 'helpfulness DESC'
  } else if (sort === 'newest') {
    sort = 'date DESC'
  } else if (sort === 'relevance') {
    sort = 'helpfulness * date DESC'
  } else {
    sort = 'review_id DESC'
  }
  let reviews = await getReviews(req.query.product_id, sort);
  let formattedReviews = [];
  let currentReviewPointer = 0;
  for (var i = 0; i < reviews.length; i++) {
    let currentPhoto;
    if (i >= 1 && reviews[i - 1].review_id === reviews[i].review_id) {
      currentPhoto = {
        id: reviews[i].photo_id,
        url: reviews[i].url
      }
      formattedReviews[currentReviewPointer - 1].photos.push(currentPhoto);
    } else {
      let currentReview = {
        review_id: reviews[i].review_id,
        rating: reviews[i].rating,
        summary: reviews[i].summary,
        recommend: reviews[i].recommend,
        response: reviews[i].response,
        body: reviews[i].body,
        date: new Date(Math.floor(Number(reviews[i].date))).toISOString(),
        reviewer_name: reviews[i].reviewer_name,
        helpfulness: reviews[i].helpfulness,
        photos: []
      }
      if (reviews[i].url !== null) {
        currentPhoto = {
          id: reviews[i].photo_id,
          url: reviews[i].url
        }
        currentReview.photos.push(currentPhoto);
      }
      formattedReviews.push(currentReview);
      currentReviewPointer++;
    }
  }
  let clientResponse = {
    product: req.query.product_id,
    page: req.query.page,
    count: req.query.count,
    results: formattedReviews.slice(req.query.page * req.query.count, (req.query.page * req.query.count) + req.query.count)
  }
  res.send(clientResponse);
})

//works
app.post('/reviews', (req, res) => {
  console.log(req.body);
  res.send('Hopefully this works');
})

//unchecked
app.put('/reviews/:review_id/helpful', (req, res) => {
  console.log('helpful');
  res.send('helpful');
})

//unchecked
app.put('/reviews/:review_id/report', (req, res) => {
  console.log('report');
  res.send('report');
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
})
