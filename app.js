// .env 파일에 저장된 환경변수들을 불러올 수 있게 해줌.
require('dotenv').config();
require('./config/passport');

const express = require('express'); // 서버를 만들기 위한 프레임워크
const session = require('express-session'); // 사용자 세션을 관리하기 위한 미들웨어
const passport = require('passport'); // 인증 처리를 위한 미들웨어
const db = require('./models'); // MYSQL 등 DB와 연결해주는 ORM(Object-Relational Mapping)
const authRoutes = require('./routes/AuthRouter');
const userRoutes = require('./routes/UserRouter');

const app = express(); // Express 앱 초기화

// 미들웨어 설정
app.use(express.json()); // JSON 요청 본문을 자동으로 파싱해서 req.body로 사용할 수 있게 해줌
app.use(express.urlencoded({ extended: true }));
app.use(
  // 로그인 유지 기능 구현을 위해 필요한 부분
  session({
    secret: process.env.SESSION_SECRET, // 쿠키 암호화에 사용
    resave: false, // 매 요청마다 세션을 저장하지 않음
    saveUninitialized: true, // 초기 세션 저장
  })
);

// Passport를 Express에 연결
app.use(passport.initialize()); // Passport 초기화

// 라우팅
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// DB 연결 및 서버 실행
db.sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('서버 실행 중: http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('DB 연결 실패', err);
  });
