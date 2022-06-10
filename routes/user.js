const express = require('express');
const router = express.Router();
const UserControllers = require('../controllers/user');
const { isAuth } = require('../service/appVerify');

// 會員功能

router.post('/user/signup',
  /*
    #swagger.tags = ['User - 會員']
    #swagger.description = '註冊 API'
    #swagger.parameters['body'] = {
      in: 'body',
      type: 'object',
      required: true,
      description: '資料格式',
      schema: { 
        $name: '',
        $email: '',
        $password: '',
        $confirmPassword: '',
      }
    }
    #swagger.responses[200] = { 
      description: '註冊資訊',
      schema: {
        status: true,
        message: '註冊成功，請重新登入'
      }
    }
  */
  UserControllers.signup
);

router.post('/user/login',
  /*
    #swagger.tags = ['User - 會員']
    #swagger.description = '登入 API'
    #swagger.parameters['body'] = {
      in: 'body',
      type: 'object',
      required: true,
      description: '資料格式',
      schema: { 
        $email: '',
        $password: '',
      }
    }
    #swagger.responses[200] = { 
      description: '登入資訊',
      schema: { $ref: '#/definitions/login' }
    }
  */
  UserControllers.login
);

router.post('/user/updatePassword', isAuth, 
  /*
    #swagger.tags = ['User - 會員']
    #swagger.description = '更新密碼 API'
    #swagger.security = [{'api_key': ['apiKeyAuth']}]
    #swagger.parameters['body'] = {
      in: 'body',
      type: 'object',
      required: true,
      description: '資料格式',
      schema: { 
        $password: '',
        $confirmPassword: '',
      }
    }
    #swagger.responses[200] = { 
      description: '更新密碼資訊',
      schema: { 
        status: true,
        message: '更新密碼成功'
      }
    }
  */
  UserControllers.updatePassword
);

router
  .route('/user/profile')
  .get(isAuth, 
    /*
      #swagger.tags = ['User - 會員']
      #swagger.description = '取得會員資料 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]
      #swagger.responses[200] = { 
        description: '會員資訊',
        schema: { $ref: '#/definitions/profile' }
      }
    */
    UserControllers.getProfile
  )
  .patch(isAuth, 
    /*
      #swagger.tags = ['User - 會員']
      #swagger.description = '更新會員資料 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]
      #swagger.parameters['body'] = {
        in: 'body',
        type: 'object',
        required: true,
        description: '資料格式',
        schema: { 
          $name: '',
          $sex: '',
          photo: ''
        }
      }
      #swagger.responses[200] = { 
        description: '會員資訊',
        schema: {
          status: true,
          message: '編輯會員資料成功'
        }
      }
    */
    UserControllers.updateProfile
  )

// 會員按讚追蹤動態

router
  .route('/user/likes')
  .get(isAuth, 
    /*
      #swagger.tags = ['User - 會員按讚追蹤']
      #swagger.description = '取得個人按讚貼文名單 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]  
      #swagger.responses[200] = { 
        description: '按讚資訊',
        schema: { $ref: '#/definitions/getLikePostList' }
      }
    */
    UserControllers.getLikePostList
  );

router.get('/user/follows', isAuth, 
  /*
    #swagger.tags = ['User - 會員按讚追蹤']
    #swagger.description = '取得個人追蹤名單 API'
    #swagger.security = [{'api_key': ['apiKeyAuth']}]  
    #swagger.responses[200] = { 
      description: '追蹤資訊',
      schema: { $ref: '#/definitions/getFollowUserList' }
    }
  */
  UserControllers.getFollowUserList
);

router.get('/user/comments', isAuth, 
  /*
    #swagger.tags = ['User - 會員按讚追蹤']
    #swagger.description = '取得個人留言貼文名單 API'
    #swagger.security = [{'api_key': ['apiKeyAuth']}]  
    #swagger.responses[200] = { 
      description: '留言貼文資訊',
      schema: { $ref: '#/definitions/getFollowUserList' }
    }
  */
  UserControllers.getCommentPostList
);

router.post('/user/:user_id/follow', isAuth, 
  /*
    #swagger.tags = ['User - 會員按讚追蹤']
    #swagger.description = '追蹤朋友 API'
    #swagger.security = [{'api_key': ['apiKeyAuth']}]  
    #swagger.responses[200] = { 
      description: '追蹤資訊',
      schema: { 
        status: true,
        message: '追蹤成功'
      }
    }
  */
  UserControllers.followUser
);

router.post('/user/:user_id/unfollow', isAuth, 
  /*
    #swagger.tags = ['User - 會員按讚追蹤']
    #swagger.description = '取消追蹤朋友 API'
    #swagger.security = [{'api_key': ['apiKeyAuth']}]  
    #swagger.responses[200] = { 
      description: '追蹤資訊',
      schema: { 
        status: true,
        message: '取消追蹤成功'
      }
    }
  */
  UserControllers.unfollowUser
);

module.exports = router;