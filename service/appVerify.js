const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../service/catchAsync');
const appError = require('../service/appError');

exports.isAuth = catchAsync(async(req, res, next) => {
  // 確認token 是否存在
  let token;
  if ( 
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
      token = req.headers.authorization.split(' ')[1];
  };

  if (!token) {
    return appError({statusCode: 401, message: '尚未登入!'}, next)
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return appError({statusCode: 401, message: '尚未登入!'}, next)
      } else {
        resolve(payload);
      }
    })
  });

  const data = await User.findById(decoded.id);
  if (!data) return appError({statusCode: 401, message: '尚未登入!'}, next);

  const { _id, name, email, photo, sex } = data;
  const currentUser = {
    _id: _id.toString(),
    name, email, photo, sex
  }

  req.user = currentUser;

  next();

  // jwt.verify 本身沒有提供 Promise 是 callBack，增加 new Promise 防止阻塞問題
});

exports.generateSendJWT = (user, res) => {
  const token = jwt.sign({id:user._id, name: user.name}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  });

  return token;
};