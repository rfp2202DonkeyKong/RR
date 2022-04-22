DROP DATABASE IF EXISTS ratings;

CREATE DATABASE ratings;

\c ratings;

DROP TABLE IF EXISTS reviews, reviewsPhotos, characteristics, characteristicReviews;

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  rating INT NOT NULL,
  date BIGINT NOT NULL,
  summary VARCHAR (255),
  body VARCHAR (1000),
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name VARCHAR (255),
  reviewer_email VARCHAR (255),
  response VARCHAR (255),
  helpfulness INT
);

CREATE TABLE reviewsPhotos(
  id SERIAL PRIMARY KEY,
  review_id INT NOT NULL,
  url VARCHAR (255)
);

CREATE TABLE characteristics(
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  name VARCHAR(255)
);

CREATE TABLE characteristicReviews(
  id SERIAL PRIMARY KEY,
  characteristic_id INT NOT NULL,
  review_id INT NOT NULL,
  value INT NOT NULL
);



\copy reviews FROM 'Database/Data/reviews.csv' NULL AS 'null' csv header;
\copy reviewsPhotos FROM 'Database/Data/reviews_photos.csv' NULL AS 'null' csv header;
\copy characteristics FROM 'Database/Data/characteristics.csv' NULL AS 'null' csv header;
\copy characteristicReviews FROM 'Database/Data/characteristic_reviews.csv' NULL AS 'null' csv header;

