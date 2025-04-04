const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Local 전략 설정
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // 폼에서 보낼 필드명
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
          return done(null, false, {
            message:
              '등록되지 않은 사용자입니다. 회원 가입 후 서비스를 이용해 주세요!',
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, {
            message: '잘못된 비밀번호입니다. 확인 후 다시 시도해주세요!',
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT 인증 전략
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, // .env에 저장
    },
    async (jwt_payload, done) => {
      try {
        const user = await User.findByPk(jwt_payload.id);
        if (user) return done(null, user);
        else return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
