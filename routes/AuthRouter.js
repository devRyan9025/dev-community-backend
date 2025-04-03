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
authRouter.post('/verify-email', express.json(), verifyEmailToken);
authRouter.post('/request-email-verification', requestEmailVerification);

// ✅ JWT 기반 로그인
authRouter.post('/login', upload.none(), (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({
        result: 'fail',
        message: info?.message || '로그인 실패',
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      result: 'success',
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        position: user.position,
        phone: user.phone,
        postcode: user.postcode,
        address: user.address,
        detailAddress: user.detailAddress,
      },
    });
  })(req, res, next);
});

module.exports = authRouter;
