const express = require('express');
const boardRouter = express.Router();
const passport = require('passport');
const {
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');

// 전체 게시글 조회
boardRouter.get('/', getAllBoards);

// 게시글 작성 (JWT 인증 필요)
boardRouter.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createBoard
);

// 게시글 상세 조회
boardRouter.get('/:id', getBoardById);

// 게시글 수정
boardRouter.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  updateBoard
);

// 게시글 삭제
boardRouter.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  deleteBoard
);

module.exports = boardRouter;
