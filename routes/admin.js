const express = require('express');

const router = express.Router();

router.get('/add-product',(req, res, next) => {
    res.send("<h1>The Add product page</h1><form action='/admin/add-product' method='POST'><input name='data'><button type='submit'>ok</button><form/>");
});

router.post('/add-product',(req, res, next) => {
  console.log(req.body);
  res.redirect('/');
})

module.exports = router;
