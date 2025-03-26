const bcrypt = require('bcrypt');
const { User } = require('../models');

// 회원가입 처리
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
    });

    res.status(201).json({ message: '회원가입 성공!' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 로그인 처리
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !user.password) {
      return res
        .status(401)
        .json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다!' });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: '로그인 성공' });
    });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};
