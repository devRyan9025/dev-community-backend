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
