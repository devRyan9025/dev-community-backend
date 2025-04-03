const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 저장 경로 및 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 루트 기준 uploads 폴더
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
