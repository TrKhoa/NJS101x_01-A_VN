const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sq = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req,res,next)=>{
    req.user = user;
    next();
})

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

//sq.sync({force: true})
sq.sync()
.then(result=>{
    return User.findByPk(1);
})
.then(user => {
    if(!user){
        return User.create({name: "Khoa", email: "Khoa@gmail.com"});
    }
    return user;
})
.then(user => {
    console.log(user);
    app.listen(3000);
})
.catch(err => console.log(err));
