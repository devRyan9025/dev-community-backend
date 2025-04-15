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
  login,
} = require('../controllers/authController');
const { isAuthenticatedJwt } = require('../middlewares/isAuthenticatedJwt');

const authRouter = express.Router();
const upload = multer();

// 회원가입
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
  register
);

// 이메일 인증
authRouter.post('/verify-email', express.json(), verifyEmailToken);
authRouter.post(
  '/request-email-verification',
  express.json(),
  requestEmailVerification
);

// 로그인
authRouter.post('/login', upload.none(), login);

// 비밀번호 확인
authRouter.post('/verify-password', isAuthenticatedJwt, verifyPassword);

module.exports = authRouter;
