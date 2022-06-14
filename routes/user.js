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
        schema: { $ref: '#/definitions/updateProfile' }
      }
    */
    UserControllers.updateProfile
  )

// 會員動態牆

router.get('/user/profileWall/:user_id', isAuth, 
  /*
    #swagger.tags= ['User - 會員']
    #swagger.description = '取得個人動態牆 API'
    #swagger.security = [{'api_key': ['apiKeyAuth']}]
    #swagger.responses[200] = { 
      description: '貼文資訊',
      schema: { $ref: '#/definitions/getProfileWall' }
    }
  */
  UserControllers.getProfileWall
);

// 會員按讚動態

router
  .route('/user/likes')
  .get(isAuth, 
    /*
      #swagger.tags = ['User - 會員留言按讚追蹤']
      #swagger.description = '取得個人按讚名單 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]  
      #swagger.responses[200] = { 
        description: '按讚資訊',
        schema: { $ref: '#/definitions/getLikePostList' }
      }
    */
    UserControllers.getLikePostList
  );

// 會員追蹤動態

router.get('/user/follows', isAuth, 
  /*
    #swagger.tags = ['User - 會員留言按讚追蹤']
    #swagger.description = '取得個人追蹤名單 API'
    #swagger.security = [{'api_key': ['apiKeyAuth']}]  
    #swagger.responses[200] = { 
      description: '追蹤資訊',
      schema: { $ref: '#/definitions/getFollowUserList' }
    }
  */
  UserControllers.getFollowUserList
);

router
  .route('/user/:user_id/follow')
  .post(isAuth, 
    /*
      #swagger.tags = ['User - 會員留言按讚追蹤']
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
  )
  .delete(isAuth, 
    /*
      #swagger.tags = ['User - 會員留言按讚追蹤']
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

// 會員留言動態

router.get('/user/comments', isAuth, 
  /*
    #swagger.tags = ['User - 會員留言按讚追蹤']
    #swagger.description = '取得個人留言名單 API'
    #swagger.security = [{'api_key': ['apiKeyAuth']}]  
    #swagger.responses[200] = { 
      description: '留言資訊',
      schema: { $ref: '#/definitions/getFollowUserList' }
    }
  */
  UserControllers.getCommentPostList
);

router
  .route('/user/comment/:comment_id')
  .patch(isAuth,
    /*
      #swagger.tags = ['User - 會員留言按讚追蹤']
      #swagger.description = '刪除一則個人留言 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]  
      #swagger.responses[200] = {
        description: '留言資訊',
        schema: {
          status: true,
          message: '刪除留言成功'
        }
      }
    */
    UserControllers.updatePostComment
  )
  .delete(isAuth,
    /*
      #swagger.tags = ['User - 會員留言按讚追蹤']
      #swagger.description = '編輯一則個人留言 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]  
      #swagger.responses[200] = {
        description: '留言資訊',
        schema: {
          status: true,
          message: '編輯留言成功'
        }
      }
    */
    UserControllers.canclePostComment
  );

module.exports = router;