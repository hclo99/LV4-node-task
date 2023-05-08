'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Comments', {
      commentId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      PostId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Posts", // Posts 모델을 참조합니다.
          key: "postId", // Posts 모델의 postId를 참조합니다.
        },
        onDelete: "CASCADE", // 만약 Users 모델의 userId가 삭제되면, Posts 모델의 데이터가 삭제됩니다.
      },
      UserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users", // Users 모델을 참조합니다.
          key: "userId", // Users 모델의 userId를 참조합니다.
        },
        onDelete: "CASCADE", // 만약 Users 모델의 userId가 삭제되면, Posts 모델의 데이터가 삭제됩니다.
      },
      nickname: {
        allowNull: false,
        type: Sequelize.STRING
      },
      comment: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false, // NOT NULL
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"), // 아무런 값을 입력하지 않을 때, 기본값은 현재시각
      },
      updatedAt: {
        allowNull: false, // NOT NULL
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments');
  }
};