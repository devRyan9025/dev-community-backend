const passport = require('passport');

// JWT 인증 미들웨어 (passport 방식)
exports.isAuthenticatedJwt = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({
        message: info?.message || '유효하지 않은 인증입니다.',
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};
