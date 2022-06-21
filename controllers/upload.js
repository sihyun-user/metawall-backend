const IMAGE = require('../models/imageModel');
const { ImgurClient } = require('imgur');
const catchAsync = require('../service/catchAsync');
const appSuccess = require('../service/appSuccess');
const appError = require('../service/appError');

// 取得圖片列表
exports.getAllImage = catchAsync(async(req, res, next) => {
  const data = await IMAGE.find();
  appSuccess({res, data});
})

// 上傳圖片
exports.uploadImage = catchAsync(async(req, res, next) => {
  if (!req.files) {
    return appError({statusCode: 400, message:'找不到檔案'}, next);
  }

  const client = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
  });

  const response = await client.upload({
    image: req.files[0].buffer.toString('base64'),
    type: 'base64',
    album: process.env.IMGUR_ALBUM_ID
  });

  let data = await IMAGE.create({ url: response.data.link });
  data = { url: data.url };

  appSuccess({res, data, message: '上傳圖片成功'});
})