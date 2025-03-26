const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');

// 전체 유저 조회
router.get('/', getAllUsers);

module.exports = router;
