const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Likes } = require("../models");
const { Posts } = require("../models");
const { sequelize } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

// 좋아요 누르기, 취소하기
router.put("/posts/:postId/like",authMiddleware, async (req,res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;

        const existPost = await Posts.findOne({ PostId: postId });
        if (!existPost) {
            return res.status(404).json({ errorMessage: "해당 게시글이 존재하지 않습니다." });
        }
    
    //게시글을 좋아하는 사람
        const liker = await Likes.findOne({ where: { [Op.and]: [{ UserId: userId }, { PostId: postId }] }});
    
    //좋아요가 없었다면 좋아요 누른거
        if (!liker) {
            await Likes.create({ PostId: postId, UserId: userId });
            return res.status(200).json({ message: "좋아요 등록 완료!" });
        } else {
            await Likes.destroy({ where: { UserId: userId, PostId: postId } });
            return res.status(200).json({ message: "좋아요 취소 완료!" });
      }
        } catch (err) {
            res.status(400).json({errorMessage: "게시글 좋아요에 실패하였습니다."});
        }
    });


// 좋아요누른 게시글 조회
router.get("/posts/like", authMiddleware, async (req, res) => {
    try {
      const { userId } = res.locals.user;
      // Like와 Post모델을 Join한 결과를 Plat Object로 변환하는 함수
  
      const posts = await Posts.findAll({
        attributes: [ "postId", "userId", "nickname", "title", "createdAt", "updatedAt",
          [sequelize.fn("COUNT", sequelize.col("Likes.PostId")), "likes"],
          //sequelize에서 제공한 fn메서드로 count한다. Like의PostId가 존재하면 counting한다. 그변수명은 likes로 한다.
        ],
        include: [
          { model: Likes, attributes: [],
            required: true, //Left outer join대신 Inner join으로 설정, false로 할경우 모든 게시물 조회
            where: {UserId: userId} },
        ],
        group: ["Posts.postId"],
        order: [["likes", "DESC"]],
        raw: true,
      });
  
      return res.status(200).json({ data: posts });
    } catch (err) {
      return res.status(400).json({ errorMessage: "좋아요 게시글 조회 실패" });
    }
  });

module.exports = router;