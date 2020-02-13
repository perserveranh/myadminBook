const express = require("express");
const multer = require("multer");
const book = express.Router();
const cors = require("cors");
const middleware = require("../middlewares");
const config = require("../config");

const Book = require("../models/Book");
book.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./public/uploads");
  },
  filename: (req, file, callback) => {
    var filename = `${file.fieldname}-${Date.now()}${file.originalname}`;
    callback(null, filename);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: config.maxSize }
});

book.get("/all", middleware.checkToken, (req, res) => {
  const page = +req.query.page;
  const pageSize = +req.query.pageSize;
  const query =
    !isNaN(page) && !isNaN(pageSize) ? { offset: page, limit: pageSize } : {};
  Book.findAll(query)
    .then(book => {
      if (book) {
        middleware.paginate({ page, pageSize }), res.send(book);
      } else {
        res.send("Book does not exist");
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving books."
      });
    });
});

book.get("/api", (req, res) => {
  const page = +req.query.page;
  const pageSize = +req.query.pageSize;
  const query =
    !isNaN(page) && !isNaN(pageSize) ? { offset: page, limit: pageSize } : {};
  Book.findAndCountAll(query)
    .then(book => {
      if (book) {
        middleware.paginate({ page, pageSize }), res.send(book);
      } else {
        res.send("Book does not exist");
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving books."
      });
    });
});

book.get("/:id", (req, res) => {
  Book.findOne({
    where: {
      BookID: req.params.id
    }
  })
    .then(book => {
      if (book) {
        res.send(book);
      } else {
        res.json({ error: "book not exists" });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving books."
      });
    });
});

book.post(
  "/",
  middleware.checkToken,
  upload.single("BookImage"),
  (req, res) => {
    const filePath =
      `${config.hostServer}` +
      "/" +
      "file" +
      "/" +
      `${req.file.path.replace("public/", "")}`;
    const bookData = {
      BookName: req.body.BookName,
      BookImage: filePath,
      BookLink: req.body.BookLink,
      authorID: req.body.authorID,
      BookDescription: req.body.BookDescription
    };
    Book.create(bookData)
      .then(book => {
        res.send({ status: "create book success", data: book });
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving books."
        });
      });
  }
);

book.put(
  "/pdf/:id",
  middleware.checkToken,
  upload.single("BookPdf"),
  (req, res) => {
    const filePath =
      `${config.hostServer}` +
      "/" +
      "file" +
      "/" +
      `${req.file.path.replace("public/", "")}`;
    Book.update(
      {
        BookPdf: filePath
      },
      {
        where: {
          BookID: req.params.id
        }
      }
    )
      .then(book => {
        res.send({ status: "Update book pdf success", book });
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving books."
        });
      });
  }
);

book.put(
  "/:BookID",
  middleware.checkToken,
  upload.single("BookImage"),
  (req, res) => {
    const filePath =
      `${config.hostServer}` +
      "/" +
      "file" +
      "/" +
      `${req.file.path.replace("public/", "")}`;
    Book.update(
      {
        BookName: req.body.BookName,
        BookImage: filePath,
        BookLink: req.body.BookLink,
        authorID: req.body.authorID,
        BookDescription: req.body.BookDescription
      },
      {
        where: {
          BookID: req.params.BookID
        }
      }
    )
      .then(book => {
        res.send({ status: "Update book success", book });
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving books."
        });
      });
  }
);

book.delete("/:id", middleware.checkToken, (req, res) => {
  Book.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Book was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Book with id=${id}. Maybe Tutorial was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving books."
      });
    });
});

book.delete("/", middleware.checkToken, (req, res) => {
  Book.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Books were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving books."
      });
    });
});

module.exports = book;
