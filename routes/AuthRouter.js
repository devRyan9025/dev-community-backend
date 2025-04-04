const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');

const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  register,
  requestEmailVerification,
  verifyEmailToken,
  verifyPassword,
} = require('../controllers/authController');

const { isAuthenticatedJwt } = require('../middlewares/isAuthenticatedJwt');

const authRouter = express.Router();
const upload = multer(); // multipart/form-data 처리용

// 회원가입: 유효성 검사 추가
authRouter.post(
  '/register',
  upload.none(),
  [
    body('name').notEmpty().withMessage('이름을 입력해주세요.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
      .matches(/(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('비밀번호는 영문과 숫자를 포함해야 합니다.'),
    body('phone')
      .optional()
      .matches(/^\d{3}-\d{4}-\d{4}$/)
      .withMessage('전화번호는 11자리를 모두 입력해주세요.'),
    body('address').notEmpty().withMessage('주소를 입력해주세요.'),
    body('detailAddress').notEmpty().withMessage('상세주소를 입력해주세요.'),
  ],
  register // 유효성 검사 후 register 컨트롤러 실행
);

// 이메일 인증 관련
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

// 비밀번호 검증
authRouter.post('/verify-password', isAuthenticatedJwt, verifyPassword);

module.exports = authRouter;
