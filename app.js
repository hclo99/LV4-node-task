const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const postsRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const commentsRouter = require("./routes/comments");
const likeRouter = require("./routes/like");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api", [postsRouter, authRouter, commentsRouter, likeRouter]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요");
});