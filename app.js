const http = require('http');

const path = require('path')

const express = require('express');
const bodyParse = require('body-parser');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: true }))

app.use('/admin',adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) =>{
  res.status(404).sendFile(path.join(__dirname,'views','404.html'));
})

const server = http.createServer(app);

server.listen(3000);
