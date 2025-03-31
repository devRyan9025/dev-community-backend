const bcrypt = require('bcrypt');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// 회원가입 처리 - Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 필수 입력사항 미 입력시 Fail
    if (!name || !email || !password) {
      return res.status(400).json({
        result: 'fail',
        message:
          '필수 입력값이 누락되었습니다. 이름, 이메일, 비밀번호를 모두 입력해주세요.',
      });
    }

    // 중복된 이메일로 가입시 Fail
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res
        .status(400)
        .json({ result: 'fail', message: '이미 존재하는 이메일입니다.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
    });

    const { id, name: newName, email: newEmail } = newUser;

    // 회원가입 성공시 Success
    res.status(201).json({
      result: 'success',
      data: {
        id,
        name: newName,
        email: newEmail,
      },
    });
  } catch (err) {
    // 서버 오류시 Fail
    res.status(500).json({ result: 'fail', error: err.message });
  }
};

// 로그인
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res
        .status(401)
        .json({ result: 'fail', message: info?.message || '인증 실패' });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      result: 'success',
      message: '로그인 성공',
      token,
    });
  })(req, res, next);
};
