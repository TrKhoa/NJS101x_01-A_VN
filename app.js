//Thêm cái gói cần thiết
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const moment = require('moment');
const MongoDBStore = require('connect-mongodb-session')(session);

//Thêm controller và model
const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://khoa:khoa@cluster1.fixlpkx.mongodb.net/asm?retryWrites=true&w=majority';

const app = express();
app.locals.moment = moment;
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime()+'-'+file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//Khai báo dùng Ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

//Khai báo Route
const authRoutes = require('./routes/auth');
const modifyRoutes = require('./routes/modify');
const showRoutes = require('./routes/show');

//Dùng bodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(flash());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/MH-2/images',express.static(path.join(__dirname, 'images')));
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
                    roll : 1,
                    vaccine:[],
                    annualLeave: 5,
                    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPyGNr2qL63Sfugk2Z1-KBEwMGOfycBribew&usqp=CAU",
                    frozen: {
                        month: [],
                        year: new Date().getFullYear()
                    }
                });
                employee.save().then(employee=>
                    {
                        const manager = new User({
                            username: 'khoa1',
                            password: 'khoa1',
                            name: 'Khoa Manager',
                            dob: '2002-01-12',
                            startDate: '2014-02-24',
                            department: 1,
                            roll : 2,
                            managerOf:[employee._id],
                            vaccine:[],
                            annualLeave: 5,
                            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPyGNr2qL63Sfugk2Z1-KBEwMGOfycBribew&usqp=CAU",
                            frozen: {
                                month: [],
                                year: new Date().getFullYear()
                            }
                        });
                        manager.save();
                    });
            }
        });
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
