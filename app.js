const http = require('http');

const path = require('path')

const express = require('express');
const bodyParse = require('body-parser');
const errorController = require('./controllers/404');

const app = express();

app.set('view engine','ejs');
app.set('views','views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin',adminData.routes);
app.use(shopRoutes);

app.use(errorController.get404);

const server = http.createServer(app);

server.listen(3000);
