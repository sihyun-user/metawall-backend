const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      required: [true, '會員ID為必填']
    },
    content: {
      type: String,
      required: [true, '貼文內容為必填']
    },
    image: {
      type: String,
      default: ''
    },
    likes: [
      { 
        type: mongoose.Schema.ObjectId, 
        ref: 'user' 
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    id: false,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 在 postSchema 建立虛擬的 comments，引用 comment model 的 post，找出有相同 _id 的物件放入 comments
postSchema.virtual('comments', {
  ref: 'comment',
  foreignField: 'post',
  localField: '_id'
});

const Post = mongoose.model('post', postSchema)

module.exports = Post