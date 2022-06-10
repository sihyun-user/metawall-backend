const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '會員名為必填']
    },
    email: {
      type: String,
      required: [true, 'Email為必填'],
      unique: true,
      lowercase: true
    },
    photo: {
      type: String,
      default: ''
    },
    sex: {
      type: String,
      enum: {
        values: ['male', 'female'],
        message: 'sex 僅接受 male、female',
      },
      default: 'male'
    },
    password: {
      type: String,
      required: [true, '密碼為必填'],
      minlength: 8,
      select: false
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    },
    followers: [
      { 
        user: { type: mongoose.Schema.ObjectId, ref: 'user' },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    following: [
      { 
        user: { type: mongoose.Schema.ObjectId, ref: 'user' },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    versionKey: false
  }
);

const User = mongoose.model('user', userSchema);

module.exports = User;