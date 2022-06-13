const User = require('../models/userModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const catchAsync = require('../service/catchAsync');
const appSuccess = require('../service/appSuccess');
const appError = require('../service/appError');
const apiState = require('../service/apiState'); 
const { checkId, generateSendJWT } = require('../service/appVerify');

// 註冊 API
exports.signup = catchAsync(async(req, res, next) => {
  let { email, password, confirmPassword, name } = req.body;
  // 內容不為空
  if (!email || !password || !confirmPassword || !name) {
    return appError(apiState.DATA_MISSING, next);
  };
  // 暱稱2個字元以上
  if (!validator.isLength(name, {min:2})) {
    return appError({statusCode: 400, message:'暱稱字數低於2碼'}, next);
  };
  // 密碼正確
  if (password !== confirmPassword) {
    return appError({statusCode: 400, message:'密碼不一致'}, next);
  };
  // 密碼8碼以上
  if (!validator.isLength(password, {min:8})) {
    return appError({statusCode: 400, message:'密碼字數低於8碼'}, next);
  };
  // 是否為Email
  if (!validator.isEmail(email)) {
    return appError({statusCode: 400, message:'E-mail格式錯誤'}, next);
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
  // 內容不為空
  if (!email || !password) {
    return appError(apiState.DATA_MISSING, next);
  }
  // 是否為Email
  if (!validator.isEmail(email)) {
    return appError({statusCode: 400, message:'E-mail格式錯誤'}, next);
  };
  // 密碼8碼以上
  if (!validator.isLength(password, {min:8})) {
    return appError({statusCode: 400, message:'密碼字數低於8碼'}, next);
  };

  const user = await User.findOne({ email }).select('+password').exec();
  if (!user) return appError({statusCode: 400, message:'E-mail帳號錯誤'}, next);

  const auth = await bcrypt.compare(password, user.password);
  if (!auth) return appError({statusCode: 400, message:'密碼錯誤'}, next);
  
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
  // 內容不為空
  if (!password || !confirmPassword) {
    return appError(apiState.DATA_MISSING, next);
  };
  // 密碼正確
  if (password !== confirmPassword) {
    return appError({statusCode: 400, message:'密碼不一致'}, next);
  };
  // 密碼8碼以上
  if (!validator.isLength(password, {min:8})) {
    return appError({statusCode: 400, message:'密碼字數低於8碼'}, next);
  };

  newPassword = await bcrypt.hash(password, 8);

  await User.findByIdAndUpdate(req.user._id, {
    password: newPassword
  }).exec();

  appSuccess({ res, message: '更新密碼成功' })
});

// 取得會員資料 API
exports.getProfile = catchAsync(async(req, res, next) => {
  const data = {
    user: req.user
  };
  appSuccess({res, data, message: '取得會員資料成功'});
});

// 編輯會員資料 API
exports.updateProfile = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const { name, sex, photo } = req.body;
  // 暱稱2個字元以上
  if (!validator.isLength(name, {min:2})) {
    return appError({statusCode: 400, message:'暱稱字數低於2碼'}, next);
  };
  // 性別僅接受 male、female
  if (sex !== 'male' && sex !== 'female') {
    return appError({statusCode: 400, message:'性別 僅接受 male、female'}, next);
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

  // 檢查 ObjectId 型別是否有誤
  if (userID && !checkId(userID)) {
    return appError(apiState.ID_ERROR, next);
  };

  const user = await User.findById(userID)
  .select('-followers._id -following._id')
  .populate({ 
    path: 'following.user followers.user', 
    select: 'name photo' 
  });
  if (!user) return appError(apiState.DATA_NOT_FOUND, next);

  const posts = await Post.find({ user: userID }).populate({
    path: 'user',
    select: 'name photo'
  }).populate({
    path: 'comments'
  }).exec();

  const data = { user, posts };
  
  appSuccess({ res, data, message: '取得個人動態牆成功' });
});

// 取得個人按讚貼文名單 API
exports.getLikePostList = catchAsync(async(req, res, next) => {
  const data = await Post.find({
    likes: { $in: [req.user._id] }
  }).populate({
    path: 'user',
    select: 'name photo'
  }).exec();

  appSuccess({ res, data, message: '取得按讚貼文名單成功' });
});

// 取得個人追蹤名單 API
exports.getFollowUserList = catchAsync(async(req, res, next) => {
  const data = await User.findById(req.user._id)
  .select('-_id followers.user following.user')
  .select('followers.createdAt following.createdAt')
  .populate({ 
    path: 'following.user followers.user', 
    select: 'name photo' 
  });
  
  appSuccess({ res, data, message: '取得追蹤名單成功' });
});

// 取得個人留言名單 API
exports.getCommentPostList = catchAsync(async(req, res, next) => {
  const user = req.user._id;
  const data = await Comment.find({ user }).exec();
  
  appSuccess({ res, data, message: '取得留言名單成功' });
});

// 刪除一則個人留言 API
exports.canclePostComment = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const commentId =  req.params.comment_id;

  // 檢查 ObjectId 型別是否有誤
  if (commentId && !checkId(commentId)) {
    return appError(apiState.ID_ERROR, next);
  };

  const data = await Comment.findById(commentId).exec();
  if(!data) {
    return appError(apiState.DATA_NOT_FOUND, next);
  } 

  const commentUserId = [data.user._id].toString();
  if (commentUserId !== userId) {
    return appError({statusCode: 400, message:'非本人不能刪除此留言'}, next);
  }

  await Comment.findByIdAndDelete(commentId).exec();

  appSuccess({ res, message: '刪除貼文留言成功' });
});

// 編輯一則個人留言 API
exports.updatePostComment = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const commentId =  req.params.comment_id;
  const { comment } = req.body;

  if (!comment) return appError(apiState.DATA_MISSING, next);

  // 檢查 ObjectId 型別是否有誤
  if (commentId && !checkId(commentId)) {
    return appError(apiState.ID_ERROR, next);
  };

  const data = await Comment.findById(commentId).exec();
  if(!data) {
    return appError(apiState.DATA_NOT_FOUND, next);
  } 

  const commentUserId = [data.user._id].toString();
  if (commentUserId !== userId) {
    return appError({statusCode: 400, message:'非本人不能刪除此留言'}, next);
  }

  Comment.findByIdAndUpdate(commentId,{
    comment
  }).exec();

  appSuccess({ res, message: '編輯貼文留言成功' });
});

// 追蹤朋友 API
exports.followUser = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const followId = req.params.user_id

  if (userId === followId) {
    return appError({statusCode: 400, message:'您無法追蹤自己'}, next);
  }

  const checkUser = await User.findById(followId).exec();
  if (!checkUser) return appError(apiState.DATA_NOT_FOUND, next);

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
  const userId = req.user._id;
  const followId = req.params.user_id

  if (userId === followId) {
    return appError({statusCode: 400, message:'您無法取消追蹤自己'}, next);
  }

  const checkUser = await User.findById(followId).exec();
  if (!checkUser) return appError(apiState.DATA_NOT_FOUND, next);

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