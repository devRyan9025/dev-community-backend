const db = require('../db/query');

const Board = {
  // 전체 목록 조회 (최신순)
  getAllBoards: async ({ limit, offset }) => {
    const sql = `SELECT b.id, b.title, b.content, b.writer AS writer_id, u.name AS writer_name, b.created_at  FROM boards b JOIN users u ON b.writer = u.id ORDER BY b.created_at ASC LIMIT ? OFFSET ?`;
    return await db.query(sql, [limit, offset]);
  },

  // 전체 게시글 개수를 가져오는 헬퍼 함수
  getBoardCount: async () => {
    const sql = `SELECT COUNT(*) AS totalCount FROM boards`;
    const rows = await db.query(sql);
    return rows[0].totalCount;
  },

  // 단일 게시글 조회
  getBoardById: async (id) => {
    const sql = `SELECT b.id, b.title, b.content, b.created_at, b.updated_at, b.writer AS writer_id, u.name AS writer_name FROM boards b JOIN users u ON b.writer = u.id WHERE b.id = ?`;
    const rows = await db.query(sql, [id]);
    return rows[0];
  },

  // 게시글 작성
  createBoard: async ({ title, writer, content }) => {
    const sql = `
      INSERT INTO boards (title, writer, content)
      VALUES (?, ?, ?)
    `;
    const result = await db.query(sql, [title, writer, content]);
    return result.insertId;
  },

  // 게시글 수정
  updateBoard: async (id, { title, writer, content }) => {
    const sql = `
      UPDATE boards
      SET title = ?, writer = ?, content = ?
      WHERE id = ?
    `;
    const result = await db.query(sql, [title, writer, content, id]);
    return result.affectedRows > 0;
  },

  // 게시글 삭제
  deleteBoard: async (id) => {
    const sql = `DELETE FROM boards WHERE id = ?`;
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Board;
