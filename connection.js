const mongoose = require("mongoose");
const User = require("./model/user");

async function connectMongoDB(url) {
  return mongoose.connect(url);
}
module.exports = {
  connectMongoDB,
};
