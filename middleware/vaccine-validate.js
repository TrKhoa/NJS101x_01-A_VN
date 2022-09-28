const {body, validationResult} = require('express-validator/check');

exports.vaccine = [
    body('vaccineType2').custom(val=>{
        if(val == 0)
            throw new Error('Hãy chọn Vaccine mũi 2');
        return true;
    }),
    body('vaccineId2').not().isEmpty().withMessage('Nhập thiếu id Vaccine mũi 2'),
    body('date2').not().isEmpty().withMessage('Nhập thiếu ngày tiêm mũi 2'),
    body('location2').not().isEmpty().withMessage('Nhập thiếu địa điểm mũi 2')
];

exports.report = [
    body('month').not().isEmpty().withMessage('Nhập thiếu số tháng'),
    body('dateTest').not().isEmpty().withMessage('Nhập thiếu ngày test'),
    body('datePcr').not().isEmpty().withMessage('Nhập thiếu ngày Pcr'),
]
