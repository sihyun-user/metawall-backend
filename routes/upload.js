const express = require('express');
const router = express.Router();
const UploadControllers = require('../controllers/upload');
const upload = require('../service/image');
const { isAuth } = require('../service/appVerify');

router
  .route('/uploads')
  .get(isAuth,
    /*
      #swagger.tags = ['Upload - 圖片']
      #swagger.description = '取得所有圖片 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]
      #swagger.responses[200] = { 
        description: '圖片資訊',
        schema: { $ref: '#/definitions/getImages' }
      }
    */
    UploadControllers.getAllImage
  )
  .delete(isAuth,
    /*
      #swagger.tags = ['Upload - 圖片']
      #swagger.description = '刪除全部圖片 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]
      #swagger.responses[200] = {
        description: '圖片資訊',
        schema: {
          status: true,
          message: '刪除所有圖片成功'
        }
      }
    */
    UploadControllers.deleteAllImage
  );

router
  .route('/upload')
  .post(isAuth, upload,
    /*
      #swagger.tags = ['Upload - 圖片']
      #swagger.description = '上傳圖片 API'
      #swagger.security = [{'api_key': ['apiKeyAuth']}]
      #swagger.consumes = ['multipart/form-data']
      #swagger.parameters['singleFile'] = {
        in: 'formData',
        name: 'image',
        type: 'file',
        required: true,
        description: '圖檔',
        schema: { 
          $image: '圖檔',
        }
      }
      #swagger.responses[200] = { 
        description: '圖片資訊',
        schema: { $ref: '#/definitions/uploadImage' }
      }
    */
    UploadControllers.uploadImage
  );


module.exports = router