const express = require('express');

const {
  getAllUsers,
  getCurrentUser,
  uploadProfileImage,
  updateUserInfo,
  checkDuplicateFilename,
} = require('../controllers/userController');
const { isAuthenticatedJwt } = require('../middlewares/isAuthenticatedJwt');
const upload = require('../middlewares/uploadMiddleware');

const userRouter = express.Router();

// JWT 토큰으로 보호
userRouter.get('/getAllUsers', getAllUsers);

// 로그인한 사용자 정보
userRouter.get('/me', isAuthenticatedJwt, getCurrentUser);
module.exports = userRouter;

// 프로필 이미지 업로드
userRouter.post(
  '/:id/upload-profile',
  upload.single('profileImage'),
  uploadProfileImage
);

// 파일 중복 확인
userRouter.get('/check-filename', checkDuplicateFilename);

// 프로필 정보 업데이트
userRouter.patch('/update', isAuthenticatedJwt, updateUserInfo);

module.exports = userRouter;
