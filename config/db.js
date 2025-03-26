// Sequelize 라이브러리에서 Sequelize 클래스를 불러옴
// 이 클래스를 사용해서 DB 연결을 설정함
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize( // new Sequelize(DB명, 사용자명, 비밀번호, { 옵션 })
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', // 사용할 DBMS를 지정(MYSQL,PostgreSQL,SQLite 등)
    logging: true, // SQL로그를 콘솔에 출력 할지 여부 (개발중에는 true로 설정 추천)
  }
);

module.exports = sequelize;
