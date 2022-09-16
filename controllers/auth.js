const User = require('../models/user');
var flash = require('connect-flash');

exports.getLogin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('MH-6/login', {
            pageTitle: 'Login',
            path: '/MH-6',
            oldInput: {
                username: ''
            },
            isAuthenticated: false,
            errorMessage: null
        });
    } else {
        res.redirect('/');
    }
}

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User
    .findOne({username: username})
    .then(user => {
        if(!user)
        {
            return res.status(422).render('MH-6/login', {
                pageTitle: 'Login',
                path: '/MH-6',
                oldInput: {
                    username: username
                },
                isAuthenticated: false,
                errorMessage: 'Username không tồn tại'
            });
        }
        if(user.password == password)
        {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return res.redirect('/');
        }
        return res.status(422).render('MH-6/login', {
            pageTitle: 'Login',
            path: '/MH-6',
            oldInput: {
                username: username
            },
            isAuthenticated: false,
            errorMessage: 'Sai tài khoản hoặc mật khẩu'
        });
    })
    .catch(err=>console.log(err));
}

exports.getLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
