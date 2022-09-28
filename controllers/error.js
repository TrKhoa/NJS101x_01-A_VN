//Trả về trang báo lỗi
exports.get404 = (req, res, next) => {
    if (!req.isLoggedIn) {
        return res.redirect('/MH-6/login');
    }
  res.status(404).render('404', { pageTitle: 'Page Not Found', userRoll: req.user.roll,  path: '/404' });
};
