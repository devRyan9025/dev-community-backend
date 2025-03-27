const bcrypt = require('bcrypt');
const { User } = require('../models');

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

// 로그인 처리 - Login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // 이메일 또는 비밀번호 미 입력시 Fail
    if (!user || !user.password) {
      return res.status(401).json({
        result: 'fail',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // 비밀번호가 DB에 있는 값과 다를 때 Fail
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        result: 'fail',
        message: '잘못된 비밀번호입니다. 재입력해주세요!',
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      // 로그인 성공시 Success
      return res.json({ result: 'success', message: '로그인 성공' });
    });
  } catch (err) {
    res.status(500).json({ result: 'fail', error: err.message });
  }
};
