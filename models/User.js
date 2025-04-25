const db = require('../db/query');

const User = {
  // 이메일로 유저 조회
  findByEmail: async (email) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const result = await db.query(sql, [email]);
    return result[0]; // 단일 유저
  },

  // ID로 유저 조회
  findById: async (id) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    const result = await db.query(sql, [id]);
    return result[0];
  },

  // 전체 유저 조회
  getAllUsers: async () => {
    const sql = `SELECT id, name, email, company, position, phone, postcode, address, detail_address, profile_image FROM users`;
    return await db.query(sql, []);
  },

  // 유저 생성
  create: async (userData) => {
    const sql = `
      INSERT INTO users 
      (email, password, name, company, position, phone, postcode, address, detail_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const {
      email,
      password,
      name,
      company,
      position,
      phone,
      postcode,
      address,
      detailAddress,
    } = userData;

    const result = await db.query(sql, [
      email,
      password,
      name,
      company,
      position,
      phone,
      postcode,
      address,
      detailAddress,
    ]);

    return result.insertId;
  },

  // 프로필 이미지 변경
  uploadProfileImage: async (userId, filename) => {
    const sql = `UPDATE users SET profile_image = ? WHERE id = ?`;
    const result = await db.query(sql, [filename, userId]);
    return result.affectedRows > 0;
  },

  // 회원정보 업데이트
  updateUserInfo: async (userId, data) => {
    const sql = `UPDATE users SET ? WHERE id = ?`;
    const result = await db.query(sql, [data, userId]);
    return result.affectedRows > 0;
  },

  // 비밀번호 변경
  updatePassword: async (userId, hashedPassword) => {
    const sql = `UPDATE users SET password = ? WHERE id = ?`;
    const result = await db.query(sql, [hashedPassword, userId]);
    return result.affectedRows > 0;
  },
};

module.exports = User;
