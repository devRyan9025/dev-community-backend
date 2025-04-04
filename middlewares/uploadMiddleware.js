const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');

// 저장 경로 및 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const originalDir = 'uploads/originalFile';

    // originalFile 폴더 없으면 생성
    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir, { recursive: true });
    }

    cb(null, originalDir); // 일단 originalFile에 저장
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeOriginal = Buffer.from(file.originalname, 'latin1').toString(
      'utf8'
    ); // 한글 복구
    cb(null, safeOriginal); // 원본 이름 그대로 저장
  },
});

const upload = multer({ storage });

module.exports = upload;
