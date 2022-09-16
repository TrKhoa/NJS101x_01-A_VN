//Thêm cái gói cần thiết
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
var flash = require('connect-flash');
const MongoDBStore = require('connect-mongodb-session')(session);

//Thêm controller và model
const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://khoa:khoa@cluster1.fixlpkx.mongodb.net/asm?retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.use(flash());

//Khai báo dùng Ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

//Khai báo Route
const authRoutes = require('./routes/auth');
const modifyRoutes = require('./routes/modify');
const showRoutes = require('./routes/show');

//Dùng bodyParser
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

//Lưu trữ user vào Req
app.use((req, res, next) => {
    if (req.session.user) {
        User.findById(req.session.user._id)
            .then(user => {
                req.user = user;
                req.isLoggedIn = 1;
                const time = new Date();
                const firstDate = 1;
                const firstMonth = 0;
                if (time.getDate() == firstDate && time.getMonth() == firstMonth) {
                    req.user.annualLeave = 5;
                    user.save();
                }
                next();
            })
            .catch(err => console.log(err));
    } else {
        req.isLoggedIn = 0;
        next();
    }
});

//Sử dụng Route
app.use(authRoutes);
app.use(modifyRoutes);
app.use(showRoutes);
app.use(errorController.get404);

//Triển khai kết nối với MongoDb thông qua mongoose
mongoose
    .connect(
        MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(result => {
        //Tạo Dummy User khi không có User
        User.findOne().then(user => {
            if (!user) {
                const employee = new User({
                    username: 'khoa2',
                    password: 'khoa2',
                    name: 'Khoa Employee',
                    dob: '2003-02-13',
                    startDate: '2015-03-25',
                    department: 1,
                    position: 1,
                    annualLeave: 5,
                    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPyGNr2qL63Sfugk2Z1-KBEwMGOfycBribew&usqp=CAU"
                });
                const manager = new User({
                    username: 'khoa1',
                    password: 'khoa1',
                    name: 'Khoa Manager',
                    dob: '2002-01-12',
                    startDate: '2014-02-24',
                    department: 1,
                    position: 2,
                    annualLeave: 5,
                    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPyGNr2qL63Sfugk2Z1-KBEwMGOfycBribew&usqp=CAU"
                });
                employee.save();
                manager.save();
            }
        });
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
