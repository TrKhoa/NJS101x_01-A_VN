module.exports = (req, res, next) => {
    if (!req.isLoggedIn) {
        return res.redirect('/MH-6/login');
    }
    next();
}
