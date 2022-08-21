//Thêm cái gói cần thiết
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Thêm controller và model
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

//Khai báo dùng Ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

//Khai báo Route
const modifyRoutes = require('./routes/modify');
const showRoutes = require('./routes/show');

//Dùng bodyParser
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

//Lưu trữ user vào Req
app.use((req, res, next) => {
    User.findById('63022cfb29174216eca750b8')
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

//Sử dụng Route
app.use(modifyRoutes);
app.use(showRoutes);
app.use(errorController.get404);

//Triển khai kết nối với MongoDb thông qua mongoose
mongoose
    .connect(
        'mongodb+srv://khoa:khoa@cluster1.fixlpkx.mongodb.net/asm?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(result => {
        //Tạo Dummy User khi không có User
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Khoa',
                    dob: '2003-02-13',
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
