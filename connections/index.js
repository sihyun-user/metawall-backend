const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path:'./config.env' });

const productionDB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABAES_PASSWORD
);

const DB = process.env.NODE_ENV === 'production' 
? productionDB 
: process.env.DATABASE_LOCAL

mongoose.connect(DB)
  .then(() => console.log('資料庫連線成功'))
  .catch((err) => console.log(err));