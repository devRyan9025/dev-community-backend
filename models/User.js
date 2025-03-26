module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true, // 테이블명 복수화 방지
      underscored: true, // camelCase → snake_case로 자동 변환
    }
  );

  return User;
};
