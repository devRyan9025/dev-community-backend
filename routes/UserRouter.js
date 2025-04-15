const express = require('express');
const userRouter = express.Router();
const passport = require('passport');
const UserModel = require('../models/User');
const upload = require('../middlewares/uploadMiddleware');
const {
  uploadProfileImage,
  checkDuplicateFilename,
  updateUserInfo,
} = require('../controllers/userController');

// JWT로 보호된 라우트 예시
userRouter.get(
  '/getLogginedUser',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    console.log('🔥 JWT에서 추출된 유저 ID:', req.user?.id); //
    try {
      const user = await UserModel.findById(req.user.id);
      res.status(200).json({ result: 'success', user: user });
    } catch (err) {
      res
        .status(500)
        .json({ result: 'fail', message: '유저 정보 불러오기 실패' });
    }
  }
);

// 🔸 프로필 이미지 업로드
userRouter.post(
  '/:id/upload-profile',
  upload.single('profileImage'),
  uploadProfileImage
);

// 🔸 파일 중복 확인
userRouter.get('/check-duplicate-filename', checkDuplicateFilename);

// 🔸 회원정보 수정
userRouter.patch(
  '/update',
  passport.authenticate('jwt', { session: false }),
  updateUserInfo
);

module.exports = userRouter;
