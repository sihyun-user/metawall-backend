const User = require('../models/userModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const catchAsync = require('../service/catchAsync');
const appSuccess = require('../service/appSuccess');
const appError = require('../service/appError');
const apiState = require('../service/apiState'); 
const { generateSendJWT } = require('../service/appVerify');

const checkPassword = (password) => {
  const check = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return check.test(password);
}

// 註冊 API
exports.signup = catchAsync(async(req, res, next) => {
  let { name, email, password, confirmPassword } = req.body;
  // 資料欄位正確
  if (!name || !email || !password ||  !confirmPassword) {
    return appError(apiState.DATA_MISSING, next);
  };
  // 暱稱不為空
  if (validator.isEmpty(name.trim())) {
    return appError({statusCode: 400, message:'暱稱不為空'}, next);
  };
  // 暱稱2個字元以上
  if (!validator.isLength(name.trim(), {min:2})) {
    return appError({statusCode: 400, message:'暱稱字數低於2碼'}, next);
  };
  // 是否為Email
  if (!validator.isEmail(email)) {
    return appError({statusCode: 400, message:'E-mail格式錯誤'}, next);
  };
  // 密碼驗證
  if (!checkPassword(password)) {
    return appError({statusCode: 400, message:'密碼需8位含或以上的字母數字'}, next);
  }
  // 密碼正確
  if (password !== confirmPassword) {
    return appError({statusCode: 400, message:'密碼不一致'}, next);
  };
  // 信箱不重複
  const data = await User.findOne({email}).exec();
  if (data) {
    return appError({statusCode: 400, message:'信箱已被使用'}, next);
  };
  // 加密密碼
  password = await bcrypt.hash(password, 12);

  await User.create({ name, email, password });

  appSuccess({ res, message: '註冊成功，請重新登入'})
}); 

// 登入 API
exports.login = catchAsync(async(req, res, next) => {
  let { email, password } = req.body;
  // 資料欄位正確
  if (!email || !password) {
    return appError(apiState.DATA_MISSING, next);
  };
  // 是否為Email
  if (!validator.isEmail(email)) {
    return appError({statusCode: 400, message:'E-mail格式錯誤'}, next);
  };
  // 密碼驗證
  if (!checkPassword(password)) {
    return appError({statusCode: 400, message:'密碼需8位含或以上的字母數字'}, next);
  }

  const user = await User.findOne({ email }).select('+password').exec();
  if (!user) {
    return appError({statusCode: 400, message:'E-mail帳號錯誤'}, next);
  };

  const checkPwd = await bcrypt.compare(password, user.password);
  if (!checkPwd) {
    return appError({statusCode: 400, message:'密碼錯誤'}, next);
  };
  
  const token = await generateSendJWT(user, res);
  const { _id, name, photo, sex } = user;

  const data = {
    user: {
      _id: _id.toString(),
      name, email, photo, sex
    },
    token
  }

  appSuccess({ res, data, message:'登入成功' })
});

// 更新密碼 API
exports.updatePassword = catchAsync(async(req, res, next) => {
  const { password, confirmPassword } = req.body;
  // 資料欄位正確
  if (!password || !confirmPassword) {
    return appError(apiState.DATA_MISSING, next);
  };
  // 密碼驗證
  if (!checkPassword(password)) {
    return appError({statusCode: 400, message:'密碼需8位含或以上的字母數字'}, next);
  };
  // 密碼正確
  if (password !== confirmPassword) {
    return appError({statusCode: 400, message:'密碼不一致'}, next);
  };
  // 加密密碼
  newPassword = await bcrypt.hash(password, 8);

  await User.findByIdAndUpdate(req.userId, {
    password: newPassword
  }).exec();

  appSuccess({ res, message: '更新密碼成功' })
});

// 取得會員資料 API
exports.getProfile = catchAsync(async(req, res, next) => {
  const userId = req.userId;

  const user = await User.findById(userId)
  .select('_id name email photo sex').exec();

  const data = { user: user };
  appSuccess({res, data, message: '取得會員資料成功'});
});

// 編輯會員資料 API
exports.updateProfile = catchAsync(async(req, res, next) => {
  const userId = req.userId;
  const { name, photo, sex } = req.body;
  // 資料欄位正確
  if (!name || !photo || !sex) {
    return appError(apiState.DATA_MISSING, next);
  };
  // 暱稱不為空
  if (validator.isEmpty(name.trim())) {
    return appError({statusCode: 400, message:'暱稱不為空'}, next);
  };
  // 暱稱2個字元以上
  if (!validator.isLength(name.trim(), {min:2})) {
    return appError({statusCode: 400, message:'暱稱字數低於2碼'}, next);
  };
  // 性別僅接受 male、female
  if (sex !== 'male' && sex !== 'female') {
    return appError({statusCode: 400, message:'性別僅接受 male、female'}, next);
  }

  const newUser = await User.findByIdAndUpdate(userId, {
    name, photo, sex
  },{new: true, runValidators: true})
  .select('-followers -following').exec();

  const data = { user: newUser }

  appSuccess({res, data, message: '編輯會員資料成功'})
});

// 取得個人動態牆 API
exports.getProfileWall = catchAsync(async(req, res, next) => {
  const userID = req.params.user_id;
  
  const user = await User.findById(userID).select('-email -sex')
  .populate({ 
    path: 'following.user followers.user', 
    select: 'name photo' 
  }).select('-following._id -followers._id')

  if (!user) return appError(apiState.DATA_NOT_FOUND, next);

  const posts = await Post.find({ user: userID }).select('-user')
  .populate({
    path: 'comments'
  })
  .exec();

  const data = { user, posts };
  
  appSuccess({ res, data, message: '取得個人動態牆成功' });
});

// 取得個人按讚名單 API
exports.getLikePostList = catchAsync(async(req, res, next) => {
  const data = await Post.find({
    likes: { $in: [req.userId] }
  })
  .populate({
    path: 'user',
    select: 'name photo'
  })
  .populate({
    path: 'comments'
  })
  .exec();

  appSuccess({ res, data, message: '取得按讚名單成功' });
});

// 取得個人追蹤名單 API
exports.getFollowUserList = catchAsync(async(req, res, next) => {
  const follow = await User.findById(req.userId)
  .populate({ 
    path: 'following.user', 
    select: 'name photo' 
  })
  .select('-following._id');

  const data = follow.following
  
  appSuccess({ res, data, message: '取得追蹤名單成功' });
});

// 取得個人留言名單 API
exports.getCommentPostList = catchAsync(async(req, res, next) => {
  const user = req.userId;
  const data = await Comment.find({ user }).select('-user')
  .populate({
    path: 'post',
    populate: {
      path: 'user comments',
      select: '-followers -following -email -sex',
    },
    select: '-followers -following'
  })
  .exec();
  
  appSuccess({ res, data, message: '取得留言名單成功' });
});

// 編輯一則個人留言 API
exports.updatePostComment = catchAsync(async(req, res, next) => {
  const userId = req.userId;
  const commentId =  req.params.comment_id;
  const { comment } = req.body;
  // 資料欄位正確
  if (!comment) {
    return appError(apiState.DATA_MISSING, next);
  }
  // 貼文留言不為空
  if (!validator.isEmpty(comment.trim())) {
    return appError({statusCode: 400, message:'貼文留言不為空'}, next);
  };

  const data = await Comment.findById(commentId).exec();
  if (!data) {
    return appError(apiState.DATA_NOT_FOUND, next);
  };

  const commentUId = [data.user._id].toString();
  if (commentUId !== userId) {
    return appError({statusCode: 400, message:'你無法編輯此則留言'}, next);
  };

  Comment.findByIdAndUpdate(commentId,{
    comment
  }).exec();

  appSuccess({ res, message: '編輯貼文留言成功' });
});

// 刪除一則個人留言 API
exports.canclePostComment = catchAsync(async(req, res, next) => {
  const userId = req.userId;
  const commentId =  req.params.comment_id;

  const data = await Comment.findById(commentId).exec();
  if (!data) {
    return appError(apiState.DATA_NOT_FOUND, next);
  };

  const commentUId = [data.user._id].toString();
  if (commentUId !== userId) {
    return appError({statusCode: 400, message:'你無法刪除此則留言'}, next);
  };

  await Comment.findByIdAndDelete(commentId).exec();

  appSuccess({ res, message: '刪除貼文留言成功' });
});

// 追蹤朋友 API
exports.followUser = catchAsync(async(req, res, next) => {
  const userId = req.userId;
  const followId = req.params.user_id

  if (userId === followId) {
    return appError({statusCode: 400, message:'您無法追蹤自己'}, next);
  }

  const checkFollow = await User.findById(followId).exec();
  if (!checkFollow) {
    return appError({statusCode: 400, message:'找不到追蹤對象'}, next);
  }

  // 個人追蹤
  await User.updateOne(
    {
      _id: userId,
      'following.user': { $ne: followId }
    },
    {
      $addToSet: { following: { user: followId } }
    }
  );

  // 對方也追蹤
  await User.updateOne(
    {
      _id: followId,
      'followers.user': { $ne: userId }
    },
    {
      $addToSet: { followers: { user: userId } }
    }
  );

  appSuccess({ res, message: '追蹤成功' })
});

// 取消追蹤朋友 API
exports.unfollowUser = catchAsync(async(req, res, next) => {
  const userId = req.userId;
  const followId = req.params.user_id

  if (userId === followId) {
    return appError({statusCode: 400, message:'您無法取消追蹤自己'}, next);
  };

  const checkFollow = await User.findById(followId).exec();
  if (!checkFollow) {
    return appError({statusCode: 400, message:'找不到追蹤對象'}, next);
  };

  // 個人取消追蹤
  await User.updateOne(
    {
      _id: userId,
    },
    {
      $pull: { following: { user: followId } }
    }
  );
  
  // 對方也取消追蹤
  await User.updateOne(
    {
      _id: followId,
    },
    {
      $pull: { followers: { user: userId } }
    }
  );

  appSuccess({ res, message: '取消追蹤成功' })
});