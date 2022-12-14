const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const status = require('http-status');

dotenv.config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWTTOKEN);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId
    };
    next();
  } catch (error) {
    res.status(status.UNAUTHORIZED).json({ error });
    console.log(mongooseErrorBeautify(error))
  }
};