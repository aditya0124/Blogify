const JWT = require("jsonwebtoken");

const secret = "$uper@123";

function createTokenFromUser(user) {
  // in payload we write that propertky of user which we want to be in token
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role,
  };

  const token = JWT.sign(payload, secret);
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenFromUser,
  validateToken,
};
