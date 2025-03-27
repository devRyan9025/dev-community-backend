const express = require('express');

const {
  getAllUsers,
  getCurrentUser,
} = require('../controllers/userController');
const { isAuthenticatedJwt } = require('../middlewares/isAuthenticatedJwt');

const userRouter = express.Router();

// JWT 토큰으로 보호
userRouter.get('/getAllUsers', isAuthenticatedJwt, getAllUsers);

// ✅ 로그인한 사용자 정보
userRouter.get('/me', isAuthenticatedJwt, getCurrentUser);
module.exports = userRouter;
