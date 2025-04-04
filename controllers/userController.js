const { User } = require('../models');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');

// 전체 유저 조회
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    // 회원정보가 아예 없을 시 Fail
    if (users.length === 0) {
      return res.status(404).json({
        result: 'fail',
        message: '회원정보가 존재하지 않습니다. 회원가입을 진행해주세요!',
      });
    }

    // 회원정보가 존재 할 시 Success
    res.status(200).json({ result: 'success', data: users });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ result: 'fail', message: '서버 오류: 유저 조회 실패' });
  }
};

// 로그인한 사용자 정보
exports.getCurrentUser = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      result: 'fail',
      message: '사용자 정보를 찾을 수 없습니다.',
    });
  }

  res.json({ result: 'success', user: user });
};

// 프로필 이미지 업로드
exports.uploadProfileImage = async (req, res) => {
  const userId = req.params.id;
  const file = req.file;

  if (!file) {
    return res
      .status(400)
      .json({ result: 'fail', message: '파일이 첨부되지 않았습니다.' });
  }

  try {
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8'
    );
    const ext = path.extname(originalName);
    const today = dayjs().format('YYYY-MM-DD');
    const todayDir = path.join('uploads', today);

    // 1. 날짜별 폴더 없으면 생성
    if (!fs.existsSync(todayDir)) {
      fs.mkdirSync(todayDir, { recursive: true });
    }

    // 2. 새 파일명 생성 (timestamp_uuid.ext)
    const newFilename = `${Date.now()}_${uuidv4()}${ext}`;
    const newPath = path.join(todayDir, newFilename);

    // 3. originalFile → 날짜폴더로 파일 복사
    const originalPath = path.join('uploads/originalFile', originalName);
    fs.copyFileSync(originalPath, newPath);

    // DB 업데이트 (선택)
    await User.update(
      { profileImage: `${today}/${newFilename}` },
      { where: { id: userId } }
    );

    res.json({ result: 'success', profileImage: `${today}/${newFilename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: 'fail', message: '프로필 업로드 실패' });
  }
};

// 파일 중복 확인
exports.checkDuplicateFilename = (req, res) => {
  const rawFilename = req.query.filename;

  if (!rawFilename) {
    return res
      .status(400)
      .json({ result: 'fail', message: '파일명이 필요합니다.' });
  }

  const filename = decodeURIComponent(rawFilename);
  console.log('🔍 중복 체크 대상 파일:', filename); // 디버깅용
  const originalDir = path.join(__dirname, '../uploads/originalFile');

  // originalFile 폴더가 없으면 먼저 만들어도 됨
  if (!fs.existsSync(originalDir)) {
    fs.mkdirSync(originalDir, { recursive: true });
  }

  const filePath = path.join(originalDir, filename);
  const exists = fs.existsSync(filePath);

  if (exists) {
    return res.json({
      result: 'exist',
      message: '이미 동일한 이름의 파일이 존재합니다.',
    });
  } else {
    return res.json({
      result: 'ok',
      message: '사용 가능한 파일입니다.',
    });
  }
};

// 회원정보 수정 (로그인된 사용자만 가능)
exports.updateUserInfo = async (req, res) => {
  const userId = req.user?.id;
  const { name, company, position, phone, address, detailAddress } = req.body;

  if (!userId) {
    return res
      .status(401)
      .json({ result: 'fail', message: '인증되지 않은 요청입니다.' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ result: 'fail', message: '사용자를 찾을 수 없습니다.' });
    }

    // 업데이트
    user.name = name;
    user.company = company;
    user.position = position;
    user.phone = phone;
    user.address = address;
    user.detailAddress = detailAddress;

    await user.save();

    const { id, email, profileImage } = user;

    res.json({
      result: 'success',
      user: {
        id,
        name,
        email,
        company,
        position,
        phone,
        address,
        detailAddress,
        profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: 'fail', message: '서버 오류' });
  }
};
