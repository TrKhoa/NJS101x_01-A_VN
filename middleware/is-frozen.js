module.exports = (req, res, next) => {
    const frozen = req.user.frozen;
    const thisMonth = new Date().getMonth()+1;
    for(var i=0;i<frozen.month.length;i++)
    {
        if(frozen.month[i]==thisMonth)
        {
            req.flash('error', 'Tài khoản hiện đang bị khóa nên không được thay đổi thông tin ngày làm');
            return res.redirect('/');
        }

    }
    next();
}
