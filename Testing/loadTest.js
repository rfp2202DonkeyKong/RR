import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '15s',
};

const BASE_URL = 'http://localhost:3001';

let randomProduct = Math.floor(Math.random() * (1000000 - 1) + 1);
export default () => {
  const responses = http.batch([
    // ['GET', `${BASE_URL}/reviews/?product_id=${randomProduct}&page=1&count=5&sort=relevance`],
    ['GET', `${BASE_URL}/reviews/meta/?product_id=${randomProduct}`]
  ]);
  sleep(1);
};
