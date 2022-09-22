module.exports = (req, res, next) => {
    if (req.user.roll<2) {
        return res.redirect('/');
    }
    next();
}
