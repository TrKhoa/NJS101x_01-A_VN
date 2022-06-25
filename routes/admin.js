const express = require('express');

const router = express.Router();

router.use('/add-product',(req, res, next) => {
    res.send("<h1>The Add product page</h1><form action='/product' method='POST'><input name='data'><button type='submit'>ok</button><form/>");
});

router.post('/product',(req, res, next) => {
  console.log(req.body);
  res.redirect('/');
})

module.exports = router;
