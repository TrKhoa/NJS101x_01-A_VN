const path = require('path');

//Nhận đường dẫn đầy đủ của ứng dụng 
module.exports = path.dirname(process.mainModule.filename);
