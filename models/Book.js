const Sequelize = require("sequelize");
const db = require("../database/db.js");

module.exports = db.sequelize.define(
  "books",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(200)
    },
    imgUrl: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    linkUrl: {
      type: Sequelize.STRING,
      validate: {
        isUrl: true,
        notEmpty: true
      }
    },
    author: {
      type: Sequelize.STRING
    },
    filepdf: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false
  }
);
