const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

//const adminRoutes = require('./routes/admin');
//const shopRoutes = require('./routes/shop');
const modifyRoutes = require('./routes/modify');
const showRoutes = require('./routes/show');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('6300a7705922cb3ba44e6983')
        .then(user => {
            req.user = user;
            const time = new Date();
            const firstDate = 1;
            const firstMonth = 0;
            if(time.getDate() == firstDate && time.getMonth() == firstMonth){
                req.user.annualLeave = 5;
                user.save();
            }
            next();
        })

        .catch(err => console.log(err));
});

//app.use('/admin', adminRoutes);
//app.use(shopRoutes);
app.use(modifyRoutes);
app.use(showRoutes);

app.use(errorController.get404);

mongoose
    .connect(
        'mongodb+srv://khoa:khoa@cluster1.fixlpkx.mongodb.net/asm?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Khoa',
                    dob: '2003-02-13',
                    salaryScale: 0,
                    startDate: '2015-03-25',
                    department: 1,
                    annualLeave: 5,
                    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPyGNr2qL63Sfugk2Z1-KBEwMGOfycBribew&usqp=CAU"
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
