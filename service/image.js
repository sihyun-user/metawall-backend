const path = require('path');
const multer = require('multer');
const appError = require('../service/appError');

const upload = multer({
  limits: {
    fileSize: 2*1024*1024 // 限定2MB,
  },
  fileFilter(req, file, next) {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileSize = parseInt(req.headers['content-length']);
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
      return appError({
        statusCode: 400, 
        message:'檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式'
      }, next);
    };
    if ( 2*1024*1024 < fileSize) {
      return appError({
        statusCode: 400, 
        message:'上傳圖片檔案大小超過限制'
      }, next);
    };
  
    next(null, true);
  },
}).any();

module.exports = upload;
