const express = require('express');
const multer = require('multer');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  register,
  requestEmailVerification,
  verifyEmailToken,
} = require('../controllers/authController');

const authRouter = express.Router();
const upload = multer(); // multipart/form-data 처리용

// ✅ 회원가입은 기존처럼 컨트롤러 사용
authRouter.post('/register', upload.none(), register);

// 회원가입 시, 이메일 인증
authRouter.get('/verify-email', verifyEmailToken);
authRouter.post('/request-email-verification', requestEmailVerification);

// ✅ JWT 기반 로그인
authRouter.post(
  '/login',
  upload.none(),
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      result: 'success',
      message: '로그인 성공',
      token,
    });
  }
);

// ✅ 로그아웃은 세션을 사용하지 않으므로 불필요하거나, 클라이언트에서 토큰 삭제만 하면 됩니다
// 필요 시 placeholder 유지
authRouter.post('/logout', (req, res) => {
  res.json({
    message:
      'JWT 인증에서는 로그아웃은 클라이언트가 토큰을 버리는 방식으로 처리됩니다.',
  });
});

module.exports = authRouter;
