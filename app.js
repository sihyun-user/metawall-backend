const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output');

// controller
const ErrorControllers = require('./controllers/error');

// service
const apiState = require('./service/apiState');
const appError = require('./service/appError');

// router
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const uploadRouter = require('./routes/upload');

const app = express();

require('./connections');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', userRouter);
app.use('/api', postRouter);
app.use('/api', uploadRouter);
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// 404 錯誤
app.use('*',(req, res, next) => {
  appError(apiState.PAGE_NOT_FOUND, next);
});

// 錯誤處理
app.use(ErrorControllers);

module.exports = app;
