const express = require('express');
const userRouter = express.Router();
const { getAllUsers } = require('../controllers/userController');

// 전체 유저 조회
userRouter.get('/getAllUsers', getAllUsers);

module.exports = userRouter;
