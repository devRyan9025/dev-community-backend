const bcrypt = require('bcrypt');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const sendVerificationEmail = require('../utils/sendVerificationEmail');

/* 회원가입 시, 이메일 인증 절차 */
exports.requestEmailVerification = async (req, res) => {
  const { email } = req.body;

  try {
    // 빈 칸 제출 시
    if (!email) {
      return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }

    // 이미 가입된 이메일 입력 시
    const exists = await User.findOne({ where: { email } });
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

/* 이메일 링크 클릭 → 클라이언트로 리다이렉트 */
exports.verifyEmailToken = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    const email = decoded.email;

    // 토큰이 유효하니, 프론트로 응답
    return res.json({ result: 'success', email });
  } catch (err) {
    console.log(err.response?.data);
    return res
      .status(400)
      .json({ result: 'fail', message: '유효하지 않은 토큰입니다.' });
  }
};

// 회원가입 처리 - Register
exports.register = async (req, res) => {
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
      company,
      position,
      phone,
      postcode,
      address,
      detailAddress,
      isVerified: true,
    });

    const {
      id,
      name: newName,
      email: newEmail,
      company: newCompany,
      position: newPosition,
      phone: newPhone,
      postcode: newPostcode,
      address: newAddress,
      detailAddress: newDetailAddress,
    } = newUser;

    // 회원가입 성공시 Success
    res.status(201).json({
      result: 'success',
      user: {
        id,
        name: newName,
        email: newEmail,
        company: newCompany,
        position: newPosition,
        phone: newPhone,
        postcode: newPostcode,
        address: newAddress,
        detailAddress: newDetailAddress,
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
        .json({ result: 'fail', message: info?.message || '로그인 실패' });
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
