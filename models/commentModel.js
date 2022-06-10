const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, '留言內容為必填']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: [true, '會員ID為必填']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'post',
      required: [true, '貼文ID為必填']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

// 有使用到 find 且跟 comment collection 有關係才會觸發
commentSchema.pre(/^find/, function(next)  {
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;