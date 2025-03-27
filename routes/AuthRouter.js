const express = require('express');
const multer = require('multer');
const { register, login } = require('../controllers/authController');

const authRouter = express.Router();
const upload = multer(); // multipart/form-data 처리용 미들웨어

// 회원가입
authRouter.post('/register', upload.none(), register);

// 로그인
authRouter.post('/login', upload.none(), login);

// 로그아웃
authRouter.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: '로그아웃 완료' });
    });
  });
});

module.exports = authRouter;
