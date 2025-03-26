const passport = require('passport');
const { User } = require('../models');

// 세션 직렬화 → 로그인에 성공하면 user.id만 세션에 저장
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 세션 역직렬화 → 클라이언트에서 쿠키를 통해 전달된 user.id 값을 이용해
// DB에서 사용자 전체 정보를 조회해서 req.user에 다시 넣어줌.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id); //! userModel.js에서 정의
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
