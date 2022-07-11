const http = require('http');

const path = require('path')

const express = require('express');
const bodyParse = require('body-parser');
const expresshbs = require('express-handlebars');

const app = express();

app.engine('hbs',expresshbs({
    layoutsDir: 'views/layouts',
    defaultLayout: 'main-layout',
    extname: 'hbs'
}));
app.set('view engine','hbs');
app.set('views','views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin',adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) =>{
  res.status(404).render('404',{title: 'Not Found'});
})

const server = http.createServer(app);

server.listen(3000);
