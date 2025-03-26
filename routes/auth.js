const express = require('express');
const multer = require('multer');
const { register, login } = require('../controllers/authController');

const router = express.Router();
const upload = multer(); // multipart/form-data 처리용 미들웨어

// 회원가입
router.post('/register', upload.none(), register);

// 로그인
router.post('/login', upload.none(), login);

// 로그아웃
router.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: '로그아웃 완료' });
    });
  });
});

module.exports = router;
