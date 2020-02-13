const Sequelize = require("sequelize");
const db = require("../database/db.js");

module.exports = db.sequelize.define(
  "books",
  {
    BookID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    BookName: {
      type: Sequelize.STRING(200)
    },
    BookImage: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    BookLink: {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
        notEmpty: true
      }
    },
    authorID: {
      type: Sequelize.INTEGER
    },
    BookPdf: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    BookDescription: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false
  }
);
