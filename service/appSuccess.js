const appSuccess = (obj) => {
  const { res, data, message } = obj;
  res.send({
    status: true,
    message,
    data,
  });
};

module.exports = appSuccess;