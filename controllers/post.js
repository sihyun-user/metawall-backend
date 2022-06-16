const Post = require('../models/postModel');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const catchAsync = require('../service/catchAsync');
const appSuccess = require('../service/appSuccess');
const appError = require('../service/appError');
const apiState = require('../service/apiState');  

// 取得貼文列表 API
exports.getAllPosts = catchAsync(async(req, res, next) => {
  const query = req.query;
  let str;

  // 關鍵字檢查
  if (query.q || /\W|[_]/g.test(query.q)){
    str = query.q.replace(/\W|_/g, '[$&]');
  } else {
    str = query.q
  }

  // 貼文關鍵字搜尋與篩選
  const timeSort = query.timeSort == 'asc' ? 'createdAt' : '-createdAt';
  const q = query.q !== undefined ? {'content': new RegExp(str)} : {};
  const userId = query.userId ? { user: query.userId } : {}
  const data = await Post.find({ ...userId, ...q })
  .populate({
    path: 'user',
    select: 'name photo'
  })
  .populate({
    path: 'comments'
  })
  .sort(timeSort).exec();

  appSuccess({res, data, message: '取得貼文列表成功'});
});

// 取得一則貼文 API
exports.getOnePost = catchAsync(async(req, res, next) => {
  const postId = req.params.post_id;

  const data = await Post.findById(postId).populate({
    path: 'user',
    select: 'name photo'
  })
  .populate({
    path: 'comments'
  })
  .exec();

  if (!data) return appError(apiState.DATA_NOT_FOUND, next);

  appSuccess({res, data, message: '取得一則貼文成功'})
});

// 新增一則貼文 API
exports.createPost = catchAsync(async(req, res, next) => {
  let { content, image } = req.body;

  // 貼文內容不為空
  content = content.trim();
  if (!content) {
    return appError({statusCode: 400, message:'貼文內容不為空'}, next);
  };

  let data = await Post.create({
    user: req.user._id, 
    content, 
    image
  });

  data = { newPostId: data._id };

  appSuccess({res, data, message: '新增一則貼文成功'});
});

// 編輯一則貼文 API
exports.updatePost = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.post_id;
  let { image, content } = req.body;

  // 貼文內容不為空
  content = content.trim();
  if (!content) {
    return appError({statusCode: 400, message:'貼文內容不為空'}, next);
  };

  const checkPost = await Post.findById(postId).exec();
  if (checkPost.user !== userId) {
    return appError({statusCode: 400, message:'你無法編輯此則貼文'}, next);
  };

  const data = await Post.findByIdAndUpdate(postId, {
    image: image,
    content: content,
  },{new: true, runValidators: true}).exec();

  if(!data) return appError(apiState.DATA_NOT_FOUND, next);

  appSuccess({res, message:'編輯一則貼文成功'})
});

// 刪除一則貼文 API
exports.deleteOnePost = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.post_id;

  const checkPost = await Post.findById(postId).exec();
  if (checkPost.user !== userId) {
    return appError({statusCode: 400, message:'你無法刪除此則貼文'}, next);
  };

  const post = await Post.findByIdAndDelete(postId);
  if (!post) return appError(apiState.DATA_NOT_FOUND, next);
  
  appSuccess({res, message:'刪除一則貼文成功'});
});

// 新增一則貼文的按讚 API
exports.addPostLike = catchAsync(async(req, res, next) => {
  const postId = req.params.post_id;

  const data = await Post.findOneAndUpdate({ _id: postId }, {
    $addToSet: { likes: req.user._id }
  },{new: true, runValidators: true}).exec();

  if (!data) return appError(apiState.DATA_NOT_FOUND, next);

  appSuccess({ res, message: '貼文按讚成功' });
});

// 取消一則貼文的按讚 API
exports.canclePostLike = catchAsync(async(req, res, next) => {
  const postId = req.params.post_id;

  const data = await Post.findOneAndUpdate({ _id: postId }, {
    $pull: { likes: req.user._id }
  }).exec();

  if (!data) return appError(apiState.DATA_NOT_FOUND, next);

  appSuccess({ res, message: '貼文取消按讚成功' });
});

// 新增一則貼文的留言 API 
exports.craetePostComment = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const postId =  req.params.post_id;
  let { comment } = req.body;

  // 貼文留言不為空
  comment = comment.trim();
  if (!comment) {
    return appError({statusCode: 400, message:'貼文留言不為空'}, next);
  };

  const post = await Post.findById(postId);
  if (!post) return appError(apiState.DATA_NOT_FOUND, next); 

  await Comment.create({
    user: userId,
    post: postId,
    comment
  });

  appSuccess({ res, message: '新增貼文留言成功' })
});
