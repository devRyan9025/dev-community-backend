const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');

const UserModel = require('../models/User'); // 커스텀 쿼리 기반 모델

// Local 로그인 전략
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findByEmail(email); // 변경됨
        if (!user) {
          return done(null, false, {
            message: '등록되지 않은 사용자입니다. 회원 가입 후 이용해주세요!',
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, {
            message: '비밀번호가 일치하지 않습니다.',
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT 토큰 전략
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        const user = await UserModel.findById(jwt_payload.id);
        console.log('JWT payload:', jwt_payload);
        console.log('DB에서 찾은 유저:', user); // 변경됨
        if (user) return done(null, user);
        else return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
