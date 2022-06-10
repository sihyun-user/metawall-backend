const apiState = {
  SUCCESS: {
    statusCode: 200,
    message: '成功'
  },
  FAIL: {
    statusCode: 400,
    message: '失敗'
  },
  ID_ERROR: {
    statusCode: 400,
    message: 'ID 格式有誤'
  },
  DATA_MISSING: {
    statusCode: 400,
    message: '資料欄位有誤或缺少欄位'
  },
  DATA_NOT_FOUND: {
    statusCode: 400,
    message: '找不到此筆資料'
  },
  PAGE_NOT_FOUND: {
    statusCode: 404,
    message: '找不到此網站路由'
  }
}

module.exports = apiState;