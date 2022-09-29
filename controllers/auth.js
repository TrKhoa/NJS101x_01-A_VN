const User = require('../models/user');
var flash = require('connect-flash');

exports.getLogin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('MH-6/login', {
            pageTitle: 'Login',
            userRoll: 0,
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
    const getCookie = req.get('Cookie').split(';');
    let lastPage = '/';
    if(getCookie[1] != undefined )
    {
        const cookieProp = getCookie[1].trim().split('=');
        if(cookieProp[0] == 'lastPage')
        {
            lastPage = cookieProp[1];
        }
        else {
            lastPage = getCookie[0].trim().split('=')[1];
        }
    }
    const username = req.body.username;
    const password = req.body.password;
    User
    .findOne({username: username})
    .then(user => {
        if(!user)
        {
            return res.status(422).render('MH-6/login', {
                pageTitle: 'Login',
                userRoll: 0,
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
            return res.redirect(lastPage);
        }
        return res.status(422).render('MH-6/login', {
            pageTitle: 'Login',
            userRoll: 0,
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
    const lastPage = req.query.page || '/';
    res.setHeader('Set-Cookie', "lastPage="+lastPage);
    req.session.destroy(err => {
        res.redirect('/');
    });
};
