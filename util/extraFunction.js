//Convert milisecond sang giờ phút giây
exports.msToTime = time => {
    var ms = time % 1000;
    time = (time - ms) / 1000;
    var secs = time % 60;
    time = (time - secs) / 60;
    var mins = time % 60;
    var hrs = (time - mins) / 60;
    return hrs + ' giờ ' + mins + ' phút ' + secs + ' giây ';
}

//Convert milisecond sang giờ
exports.msToHours = time => {
    var ms = time % 1000;
    time = (time - ms) / 1000;
    var secs = time % 60;
    time = (time - secs) / 60;
    var mins = time % 60;
    var hrs = (time - mins) / 60;
    return hrs;
}

//Hiển thị theo format ngày/tháng/năm
exports.dateFormat = date => {
    return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear()
}

//Convert sang giờ
exports.toHour = time => {
    return (new Date(time)).getHours();
}
//Covert sang giờ dùng chung

exports.toUTC = date => {
    return new Date(date.toDateString());
}

//Convert giờ sang milisecond
exports.toMilis = time => {
    return time * 60 * 60 * 1000;
}
//For debug: new Date(new Date(new Date(new Date().setDate(5)).setMonth(5)).setHours(23))
