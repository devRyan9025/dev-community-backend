const Sequelize = require('sequelize'); // Sequelize 라이브러리에서 ORM 기능을 가져옴
const sequelize = require('../config/db'); // MYSQL DB와 연결된 인스턴스를 ../config.db.js에서 불러옴

const db = {}; // 여러 모델을 담기 위한 db 객체 생성

// Sequelize와 연결 인스턴스를 db 객체에 담아 외부에서도 접근 가능하게 함
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 모델들을 한 파일에서 불러와서 등록하는 과정
db.User = require('./user')(sequelize, Sequelize.DataTypes);

module.exports = db;
