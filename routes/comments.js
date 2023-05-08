const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { Posts } = require("../models");
const { Comments } = require("../models");

// 댓글 조회
// 댓글 정규 표현식 -> const RE_COMMENT = /^[\s\S]{1,100}$/; 
router.get("/posts/:postId/comments", async (req, res) => {
    const {postId} = req.params;
    const comments = await Comments.findAll(
        { attributes: [ "commentId", "userId", "nickname", "comment", "createdAt", "updatedAt" ],
        where: {postId:postId} }
    );

    try {
        const existpost = await Posts.findByPk(postId);
        if (!existpost) {
            return res.status(400).json({ message: "게시글이 존재하지 않습니다."});
        }
        return res.status(200).json({comments});
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다."});
    }
  });

// 댓글 작성
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
    const { nickname, userId } = res.locals.user;
    const { postId } = req.params;
    const { comment } = req.body;

    try {
        if ( Object.keys(req.body).length !== 1 || comment === undefined ) {
            return res.status(412).json({ message: "데이터 형식이 올바르지 않습니다." });
        }

        const existpost = await Posts.findByPk(postId);
        if (!existpost) {
            return res.status(404).json({ message: "게시글이 존재하지 않습니다."});
        }
        
        if (!comment) {
            return res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요."});
        }

        await Comments.create({ PostId: postId, UserId: userId, nickname, comment });
        return res.status(201).json({ message: "댓글을 작성하였습니다."});

    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다."});
    }
  });

// 댓글 수정
router.put("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const { commentId, postId } = req.params;
    const{ userId } = res.locals.user;
    const { comment } = req.body;
    const comments = await Comments.findByPk(commentId);

    try {
        if (Object.keys(req.body).length !== 1 || comment === undefined ) {
            return res.status(412).json({ message: "데이터 형식이 올바르지 않습니다." });
        }

        if (comments.UserId !== userId) {
            return res.status(403).json({ message: "댓글의 수정 권한이 존재하지 않습니다." });
        }

        const existpost = await Posts.findByPk(postId);
        if (!existpost) {
            return res.status(404).json({ message: "게시글이 존재하지 않습니다."});
        }

        const existcom = await Posts.findByPk(commentId);
        if (!existcom) {
            return res.status(404).json({ message: "댓글이 존재하지 않습니다."});
        }

        if (!comment) {
            return res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요." });
        }

        await Comments.update (
            { comment, updatedAt: Date.now() },
            { where: { commentId: commentId } }
        ).catch((err) => {
            res.status(401).json({ errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다." });
        });
        
        return res.status(200).json({ message: "댓글을 수정하였습니다." });
    } catch (err) {
        console.log(err);
        res.status(400).json({ errorMessage: "댓글 수정에 실패하였습니다."});
    }
  });

  //게시글 삭제
router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;
    const post = await Posts.findOne({ where: { postId: postId } });
    const comment = await Comments.findOne({ where: { commentId: commentId } });
  
    try {
      if (!post) {
        return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
      }

      if (!comment) {
        return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
      }
  
      if (comment.UserId !== userId) {
        return res.status(403).json({ message: "댓글의 삭제 권한이 존재하지 않습니다." });
      }
  
      await Comments.destroy({ where: { commentId: commentId } }).catch((err) => {
        console.log(err);
        return res.status(401).json({ errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다." });
      });
      return res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
  });
  
  module.exports = router;