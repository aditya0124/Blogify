// const { validate } = require("../model/user");
const { validateToken } = require("../services/auth");

function checkForAuthenticationCookies(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName]; // we takeout our cookie value from our request

    if (!tokenCookieValue) {
      // if no cookie value call the next fn.
      return next();
    }
    // if we have token we called our fn to validate thic token
    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload; //
    } catch (error) {}
    return next();
  };
}

module.exports = {
  checkForAuthenticationCookies,
};
//read about cookie-parser
