const express = require("express");
const multer = require("multer");
var pdf = require("html-pdf");
const books = express.Router();
const cors = require("cors");
const path = require("path");
const middleware = require("../middlewares");
const config = require("../config");

const Book = require("../models/Book");
books.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./public/uploads");
  },
  filename: (req, file, callback) => {
    var filename = `${file.fieldname}-${Date.now()}${file.originalname}`;
    callback(null, filename);
  }
});
const upload = multer({ storage: storage });

books.get("/", middleware.checkToken, (req, res) => {
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

books.get("/api", (req, res) => {
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

books.get("/:id", (req, res) => {
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

books.post(
  "/",
  middleware.checkToken,
  upload.single("BookImage"),
  (req, res) => {
    console.log("storage location is ", req.hostname + "/" + req.file.path);
    const filePath =
      `${req.hostname}` + "/" + `${req.file.path.replace("public/", "")}`;
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

books.put(
  "/pdf/:id",
  middleware.checkToken,
  upload.single("BookPdf"),
  (req, res) => {
    console.log("storage location is ", req.hostname + "/" + req.file.path);
    console.log("req", req);
    const filePath =
      `${req.hostname}` + "/" + `${req.file.path.replace("public/", "")}`;
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

books.put(
  "/:BookID",
  middleware.checkToken,
  upload.single("BookImage"),
  (req, res) => {
    console.log("storage location is ", req.hostname + "/" + req.file.path);
    const filePath =
      `${req.hostname}` + "/" + `${req.file.path.replace("public/", "")}`;
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

books.delete("/:id", middleware.checkToken, (req, res) => {
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

books.delete("/", middleware.checkToken, (req, res) => {
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

module.exports = books;
