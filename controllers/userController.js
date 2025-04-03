const { User } = require('../models');

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
    const transFilename = file.filename; // 전체 경로가 아닌 파일명만 저장

    // DB 업데이트 (선택)
    await User.update(
      { profileImage: transFilename },
      { where: { id: userId } }
    );

    res.json({ result: 'success', profileImage: transFilename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: 'fail', message: '프로필 업로드 실패' });
  }
};
