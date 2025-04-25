const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 임시 저장 디렉토리
const tmpDir = 'uploads/tmp';

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Multer가 임시 저장소에 파일 저장
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir); // tmp 폴더에 저장
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeOriginal = Buffer.from(file.originalname, 'latin1').toString(
      'utf8'
    ); // 한글 복원

    const uniqueName = `${Date.now()}_${safeOriginal}`; // 중복 방지
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;
