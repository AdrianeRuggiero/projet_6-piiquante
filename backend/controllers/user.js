const bcrypt = require('bcrypt');
const user = require('../models/user')
const jwt = require('jsonwebtoken');
const status = require('http-status');

exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, process.env.SALT)
    .then(hash => {
      const user = new user({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(status.CREATED).json({ message: 'Utilisateur créé !' }))
        .catch(error => {
          res.status(status.BAD_REQUEST).json({ error })
          console.log(mongooseErrorBeautify(error))
        });
    })
    .catch(error => {
      res.status(status.INTERNAL_SERVER_ERROR).json({ error })
      console.log(mongooseErrorBeautify(error))
    });
};

exports.login = (req, res, next) => {
  user.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(status.UNAUTHORIZED).json({ error: 'Utilisateur et/ou mot de passe incorrect !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(status.UNAUTHORIZED).json({ error: 'Utilisateur et/ou mot de passe incorrect !' });
          }
          res.status(status.OK).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id },
              process.env.JWTTOKEN, { expiresIn: '6h' }
            )
          });
        })
        .catch(error => {
          res.status(status.INTERNAL_SERVER_ERROR).json({ error })
          console.log(mongooseErrorBeautify(error))
        });
    })
    .catch(error => {
      res.status(status.INTERNAL_SERVER_ERROR).json({ error })
      console.log(mongooseErrorBeautify(error))
    });
};