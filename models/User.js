module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
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
      company: {
        type: DataTypes.STRING,
      },
      position: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      postcode: {
        type: DataTypes.INTEGER,
      },
      address: {
        type: DataTypes.STRING,
      },
      detailAddress: {
        type: DataTypes.STRING,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      freezeTableName: true, // 테이블명 복수화 방지
      underscored: true, // camelCase → snake_case로 자동 변환
    }
  );

  return User;
};
