const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { validationResult } = require('express-validator');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const UserModel = require('../models/User');

// 회원가입
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ result: 'fail', message: errors.array()[0].msg });
  }

  const {
    name,
    email,
    password,
    company,
    position,
    phone,
    postcode,
    address,
    detailAddress,
  } = req.body;

  try {
    const exists = await UserModel.findByEmail(email);
    if (exists) {
      return res
        .status(400)
        .json({ result: 'fail', message: '이미 존재하는 이메일입니다.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({
      name,
      email,
      password: hashed,
      company,
      position,
      phone,
      postcode,
      address,
      detailAddress,
      isVerified: true,
    });

    const newUser = await UserModel.findById(userId);

    res.status(201).json({
      result: 'success',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        company: newUser.company,
        position: newUser.position,
        phone: newUser.phone,
        postcode: newUser.postcode,
        address: newUser.address,
        detailAddress: newUser.detail_address,
      },
    });
  } catch (err) {
    res.status(500).json({ result: 'fail', error: err.message });
  }
};

// 이메일 인증 메일 보내기
exports.requestEmailVerification = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }

    const exists = await UserModel.findByEmail(email);
    if (exists) {
      return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
    }

    const token = jwt.sign({ email }, process.env.JWT_EMAIL_SECRET, {
      expiresIn: '10m',
    });

    const link = `${
      process.env.FRONT_URL
    }/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    await sendVerificationEmail(email, link);

    return res.json({ message: '이메일로 인증 링크를 전송했습니다.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '이메일 전송 실패' });
  }
};

// 이메일 인증 토큰
exports.verifyEmailToken = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    const email = decoded.email;
    return res.json({ result: 'success', email });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ result: 'fail', message: '유효하지 않은 토큰입니다.' });
  }
};

// 로그인
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res
        .status(401)
        .json({ result: 'fail', message: info?.message || '로그인 실패' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      result: 'success',
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        position: user.position,
        phone: user.phone,
        postcode: user.postcode,
        address: user.address,
        detailAddress: user.detailAddress,
      },
    });
  })(req, res, next);
};

// 비밀번호 인증
exports.verifyPassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.user?.id;

  if (!password || !userId) {
    return res
      .status(400)
      .json({ result: 'fail', message: '비밀번호를 입력해주세요.' });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ result: 'fail', message: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ result: 'fail', message: '비밀번호가 일치하지 않습니다.' });
    }

    res.json({ result: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: 'fail', message: '서버 오류' });
  }
};
