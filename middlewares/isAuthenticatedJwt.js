const passport = require('passport');

exports.isAuthenticatedJwt = passport.authenticate('jwt', { session: false });
