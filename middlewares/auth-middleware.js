const jwt = require("jsonwebtoken");
const { Users } = require("../models");

// 사용자 인증 미들웨어 -> app.js에 cookie-parser 존재 확인
module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");

  if (!authToken || authType !== "Bearer") {
    res.status(403).send({ errorMessage: "로그인이 필요한 기능입니다."});
    return;
  }

  try {
    // 만든 token을 decode(해독) 해봐야하기때문에 jwt를 가져옴옴(맨위)
    const decodedToken = jwt.verify(authToken, "clo_key");
    const userId = decodedToken.userId;
    // decode한 token내 userId를 가지고 사용자 인증
    const user = await Users.findOne({ where: { userId } });
    // 전역으로 돌리기
    res.locals.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.clearCookie("Authorization");
    return res.status(403).send({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다"});
  }
};