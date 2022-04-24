const {getReviews, getMetaReviews, reportReview, addHelpfulReview, postReview} = require('../Database/database.js');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;
app.use(express.json());

const getCharacteristicData = (data) => {
  let characteristics = new Set();
  let chars = [];
  var charsObj = {};
  var FitCounter = 0;
  var FitValue = 0;
  var FitId = 0;
  var QualityCounter = 0;
  var QualityValue = 0;
  var QualityId = 0;
  var LengthCounter = 0;
  var LengthValue = 0;
  var LengthId = 0;
  var ComfortCounter = 0;
  var ComfortValue = 0;
  var ComfortId = 0;
  var WidthCounter = 0;
  var WidthValue = 0;
  var WidthId = 0;
  var SizeCounter = 0;
  var SizeValue = 0;
  var SizeId = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i].name === 'Fit') {
      FitCounter++;
      FitValue += data[i].value;
      FitId = data[i].char_id;
    }
    if (data[i].name === 'Quality') {
      QualityCounter++;
      QualityValue += data[i].value;
      QualityId = data[i].char_id;
    }
    if (data[i].name === 'Size') {
      SizeCounter++;
      SizeValue += data[i].value;
      SizeId = data[i].char_id;
    }
    if (data[i].name === 'Comfort') {
      ComfortCounter++;
      ComfortValue += data[i].value;
      ComfortId = data[i].char_id;
    }
    if (data[i].name === 'Length') {
      LengthCounter++;
      LengthValue += data[i].value;
      LengthId = data[i].char_id;
    }
    if (data[i].name === 'Width') {
      WidthCounter++;
      WidthValue += data[i].value;
      WidthId = data[i].char_id;
    }
    characteristics.add(data[i].name);
  }
  var characteristicsArray = Array.from(characteristics);
  for (var j = 0; j < characteristicsArray.length; j++) {
    if (characteristicsArray[j] === 'Fit') {
      charsObj['Fit'] = createCharacteristicObject((FitValue / FitCounter), FitId);
    }
    if (characteristicsArray[j] === 'Quality') {
      charsObj['Quality'] = createCharacteristicObject((QualityValue / QualityCounter), QualityId)
    }
    if (characteristicsArray[j] === 'Size') {
      charsObj['Size'] = createCharacteristicObject((SizeValue / SizeCounter), SizeId)
    }
    if (characteristicsArray[j] === 'Comfort') {
      charsObj['Comfort'] = createCharacteristicObject((ComfortValue / ComfortCounter), ComfortId)
    }
    if (characteristicsArray[j] === 'Length') {
      charsObj['Length'] = createCharacteristicObject((LengthValue / LengthCounter), LengthId);
    }
    if (characteristicsArray[j] === 'Width') {
      charsObj['Width'] = createCharacteristicObject((WidthValue / WidthCounter), WidthId)
    }
  }
  return charsObj;
};

const createCharacteristicObject = (value, id) => {
  var innerCharacteristic = {
    id: id,
    value: value.toString()
  };
  return innerCharacteristic;
}

const getRatingsData = (data) => {
  var ratingsObject = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0
  }
  for (var i = 0; i < data.length; i++) {
    if (i === 0) {
      ratingsObject[data[i].rating]++;
    }
    if (i > 0 && data[i].review_id !== data[i - 1].review_id) {
      ratingsObject[data[i].rating]++;
    }
  }
  for (var rating in ratingsObject) {
    ratingsObject[rating] = ratingsObject[rating].toString();
  }
  return ratingsObject;
};

const getRecommendedData = (data) => {
  var recommendationObject = {
    'false': 0,
    'true': 0
  }
  for (var i = 0; i < data.length; i++) {
    if (i === 0) {
      if (data[i].recommend === true) {
        recommendationObject.true++;
      } else {
        recommendationObject.false++;
      }
    }
    if (i > 0 && data[i].review_id !== data[i - 1].review_id) {
      if (data[i].recommend === true) {
        recommendationObject.true++;
      } else {
        recommendationObject.false++;
      }
    }
  }
  recommendationObject.true = recommendationObject.true.toString();
  recommendationObject.false = recommendationObject.false.toString();
  return recommendationObject;
}
//works
app.get('/reviews/meta', async (req, res) => {
  if (req.query.product_id) {
    var metaReviews = await getMetaReviews(req.query.product_id);
    var result = {
      product_id: req.query.product_id.toString(),
      ratings: getRatingsData(metaReviews),
      recommended: getRecommendedData(metaReviews),
      characteristics: getCharacteristicData(metaReviews)
    }
    res.send(result);
  } else {
    res.send(401);
  }
})

//works
app.get('/reviews', async (req, res) => {
  let count = Number(req.query.count);
  let page = Number(req.query.page);
  let truePage = 0;
  if (page === 0) {
    truePage = 0;
  } else {
    truePage = page - 1;
  }
  let sort = req.query.sort;
  if (sort === 'helpful') {
    sort = 'helpfulness DESC'
  } else if (sort === 'newest') {
    sort = 'date DESC'
  } else if (sort === 'relevant') {
    sort = 'CASE WHEN helpfulness > 0 THEN helpfulness * date ELSE date END DESC'
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
        review_id: Number(reviews[i].review_id),
        rating: Number(reviews[i].rating),
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
  let paginatedReviews = formattedReviews.slice(truePage * count, (truePage * count) + count);
  let clientResponse = {
    product: req.query.product_id,
    page: page,
    count: count,
    results: paginatedReviews
  }
  res.send(clientResponse);
})

//works
app.put('/reviews/:review_id/report', async (req, res) => {
  await reportReview(req.params.review_id);
  res.sendStatus(204);
})

//works
app.put('/reviews/:review_id/helpful', async (req, res) => {
  await addHelpfulReview(req.params.review_id);
  res.sendStatus(204);
})

//works
app.post('/reviews', async (req, res) => {
  await postReview(req.body);
  res.send(201);
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
})
