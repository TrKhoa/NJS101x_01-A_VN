const http = require('http');

const express = require('express');
const bodyParse = require('body-parser');

const app = express();

app.use(express.urlencoded({ extended: true }))

app.use('/',(req,res,next)=>{
  console.log('Đây là cái luôn chạy');
  next();
})

app.use('/add-product',(req, res, next) => {
    res.send("<h1>The Add product page</h1><form action='/product' method='POST'><input name='data'><button type='submit'>ok</button><form/>");
});

app.use('/product',(req, res, next) => {
  console.log(req.body);
  res.redirect('/');
})

app.use((req, res, next) => {
    res.send('<h1>Hello from Express!</h1>');
});

const server = http.createServer(app);

server.listen(3000);
