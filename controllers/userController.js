const UserModel = require('../models/User');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const camelToSnake = require('../utils/caseConverter');

// 파일 내용을 SHA256 해시로 변환
const getFileHash = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex');

// 전체 유저 조회
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    if (users.length === 0) {
      return res.status(404).json({
        result: 'fail',
        message: '회원정보가 존재하지 않습니다. 회원가입을 진행해주세요!',
      });
    }
    res.status(200).json({ result: 'success', data: users });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ result: 'fail', message: '서버 오류: 유저 조회 실패' });
  }
};

// 로그인한 사용자 정보
exports.getLogginedUser = async (req, res) => {
  console.log('🔥 JWT에서 추출된 유저 ID:', req.user?.id);
  const userId = req.user?.id;
  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(404).json({
      result: 'fail',
      message: '사용자 정보를 찾을 수 없습니다.',
    });
  }
  res.status(200).json({ result: 'success', user: user });
};

// 프로필 이미지 업로드
exports.uploadProfileImage = async (req, res) => {
  const userId = req.params.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      result: 'fail',
      message: '파일이 첨부되지 않았습니다.',
    });
  }

  try {
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8'
    );
    const ext = path.extname(originalName);
    const today = dayjs().format('YYYY-MM-DD');
    const todayDir = path.join('uploads', today);

    // 날짜 디렉토리 생성
    if (!fs.existsSync(todayDir)) {
      fs.mkdirSync(todayDir, { recursive: true });
    }

    const newFilename = `${Date.now()}_${uuidv4()}${ext}`;
    const newPath = path.join(todayDir, newFilename);

    const originalDir = path.join('uploads', 'originalFile');
    const originalPath = path.join(originalDir, originalName);

    // originalFile 디렉토리 없으면 생성
    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir, { recursive: true });
    }

    // 기존 originalFile에 동일한 이름의 파일이 있다면 삭제
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }

    // 업로드된 임시파일 → originalFile 폴더로 복사
    fs.copyFileSync(file.path, originalPath);

    // originalFile → 날짜 폴더로 저장
    fs.copyFileSync(originalPath, newPath);

    // 임시파일 삭제 (optional)
    fs.unlinkSync(file.path);

    // DB 반영
    await UserModel.uploadProfileImage(userId, `${today}/${newFilename}`);

    res.json({ result: 'success', profile_image: `${today}/${newFilename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: 'fail', message: '프로필 업로드 실패' });
  }
};

// 파일 중복 확인
exports.checkDuplicateFilename = (req, res) => {
  const rawFilename = req.query.filename;
  const uploadedHash = req.query.hash;

  if (!rawFilename || !uploadedHash) {
    return res
      .status(400)
      .json({ result: 'fail', message: '파일명 또는 해시가 누락되었습니다.' });
  }

  const filename = decodeURIComponent(rawFilename);
  const originalDir = path.join(__dirname, '../uploads/originalFile');
  const filePath = path.join(originalDir, filename);

  if (!fs.existsSync(originalDir)) {
    fs.mkdirSync(originalDir, { recursive: true });
  }

  // 기존 파일이 없다면 → 바로 ok 리턴
  if (!fs.existsSync(filePath)) {
    return res.json({ result: 'ok', message: '사용 가능한 파일입니다.' });
  }

  // 기존 파일 읽어서 해시 비교
  const existingBuffer = fs.readFileSync(filePath);
  const existingHash = getFileHash(existingBuffer);

  if (uploadedHash === existingHash) {
    return res.json({
      result: 'same',
      message: '동일한 파일이 이미 존재합니다. 업로드할 필요가 없습니다.',
    });
  } else {
    return res.json({
      result: 'exist',
      message: '동일한 이름의 다른 파일이 존재합니다.',
    });
  }
};

// 회원정보 수정
exports.updateUserInfo = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ result: 'fail', message: '인증되지 않은 요청입니다.' });
  }

  try {
    const { name, company, position, phone, address, detailAddress } = req.body;

    // camelCase → snake_case 변환
    const updateData = camelToSnake({
      name,
      company,
      position,
      phone,
      address,
      detailAddress,
    });

    const success = await UserModel.updateUserInfo(userId, updateData);

    if (!success) {
      return res.status(500).json({ result: 'fail', message: '업데이트 실패' });
    }

    const updatedUser = await UserModel.findById(userId);
    res.json({ result: 'success', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: 'fail', message: '서버 오류' });
  }
};
