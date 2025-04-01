const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (to, link) => {
  await transporter.sendMail({
    from: `"Dev Community" <${process.env.EMAIL_FROM}>`,
    to,
    subject: '이메일 인증을 완료해주세요',
    html: `
      <p>Dev Community에 가입하려면 아래 링크를 클릭하세요:</p>
      <a href="${link}">${link}</a>
      <p>이 링크는 10분간 유효합니다.</p>
    `,
  });
};

module.exports = sendVerificationEmail;
