const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Meta API', // 文件名稱
    description: '範例生成文件' // 文件描述
  },
  host: 'intense-lake-77359.herokuapp.com', // (重要) 本地: localhost:3005 | heroku: intense-lake-77359.herokuapp.com
  schemes: ['http', 'https'], // swagger文件支援哪幾種模式
  securityDefinitions: {
    api_key: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: '請加上 API Token'
    }
  },
  definitions: {
    login: {
      status: true,
      message: '登入成功',
      data: {
        user: {
          _id: '會員ID',
          name: '會員名',
          email: '會員E-mail',
          photo: '頭貼網址',
          sex: '[male、female]'
        },
        token: ''
      }
    },
    profile: {
      status: true,
      message: '取得會員資料成功',
      data: {
        user: {
          _id: '會員ID',
          name: '會員名',
          email: '會員E-mail',
          photo: '頭貼網址',
          sex: '[male、female]'
        }
      }
    },
    updateProfile: {
      status: true,
      message: '編輯會員資料成功',
      data: {
        user: {
          _id: '會員ID',
          name: '會員名',
          email: '會員E-mail',
          photo: '頭貼網址',
          sex: '[male、female]'
        }
      }
    },
    updatePassword: {
      status: true,
      data: {
        user: {
          _id: '會員ID',
          name: '會員名',
          email: '會員E-mail',
          photo: '頭貼網址',
          sex: '[male、female]'
        },
        token: ''
      }
    },
    getFollowUserList: {
      status: true,
      message: '取得追蹤名單成功',
      data: [{ 
        user: {
          _id: '會員ID',
          name: '會員名',
          photo: '頭貼網址'
        },
        createdAt: '追蹤時間'
      }]
    },
    getLikePostList: {
      status: true,
      message: '取得追蹤名單成功',
      data: [{
        _id: '貼文ID',
        user: {
          _id: '會員ID',
          name: '會員名',
          photo: '頭貼網址'
        },
        content: '貼文內容',
        image: '圖片網址',
        likes: ['會員ID'],
        createdAt: '按讚貼文時間'
      }]
    },
    getCommentPostList: {
      status: true,
      message: '取得留言貼文名單成功',
      data: [{
        _id: '貼文ID',
        user: {
          _id: '會員ID',
          name: '會員名',
          photo: '頭貼網址'
        },
        comment: '留言內容',
        createdAt: '按讚貼文時間'
      }]
    },
    getPosts: {
      status: true,
      message: '取得貼文名單成功',
      data: [{
        _id: '貼文ID',
        user: {
          _id: '會員ID',
          name: '會員名',
          photo: '頭貼網址'
        },
        content: '貼文內容',
        image: '圖片網址',
        likes: ['會員ID'],
        comments: [{
          _id: '留言ID',
          user: {
            _id: '會員ID',
            name: '會員名',
            photo: '頭貼網址'
          },
          post: '貼文ID',
          comment: '留言內容',
          createdAt: '留言時間'
        }],
        createdAt: '貼文建立時間'
      }]
    },
    getOnePost: {
      status: true,
      message: '取得一則貼文成功',
      data: {
        _id: '貼文ID',
        user: {
          _id: '會員ID',
          name: '會員名',
          photo: '頭貼網址'
        },
        content: '貼文內容',
        image: '圖片網址',
        likes: ['會員ID'],
        comments: [{
          _id: '留言ID',
          user: {
            _id: '會員ID',
            name: '會員名',
            photo: '頭貼網址'
          },
          post: '貼文ID',
          comment: '留言內容',
          createdAt: '留言時間'
        }],
        createdAt: '貼文建立時間'
      }
    },
    getProfileWall: {
      status: true,
      message: '取得個人動態牆成功',
      data: {
        user: {
          _id: '會員ID',
          name: '會員名',
          email: '會員E-mail',
          photo: '頭貼網址',
          sex: '[male、female]',
          followers: [{ 
            user: {
              _id: '會員ID',
              name: '會員名',
              photo: '頭貼網址'
            },
            createdAt: '追蹤時間'
          }],
          following: [{ 
            user: {
              _id: '會員ID',
              name: '會員名',
              photo: '頭貼網址'
            },
            createdAt: '追蹤時間'
          }]
        },
        posts: {
          _id: '貼文ID',
          user: {
            _id: '會員ID',
            name: '會員名',
            photo: '頭貼網址'
          },
          content: '貼文內容',
          image: '圖片網址',
          likes: ['會員ID'],
          comments: [{
            _id: '留言ID',
            user: {
              _id: '會員ID',
              name: '會員名',
              photo: '頭貼網址'
            },
            post: '貼文ID',
            comment: '留言內容',
            createdAt: '留言時間'
          }],
          createdAt: '貼文建立時間'
        }
      }
    },
    getImages: {
      status: true,
      data: [{
        _id: '圖片ID',
        url: '圖片網址',
        createdAt: '圖片建立時間'
      }]
    }
  }
};

const outputFile = './swagger-output.json'; // 輸出的文件名稱(swagger json文件)
const endpointsFiles = ['./app.js'] // 讀取的檔案(進入點)

swaggerAutogen(outputFile, endpointsFiles, doc);