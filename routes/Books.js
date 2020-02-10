const express = require("express");
const multer = require("multer");
var pdf = require("html-pdf");
const books = express.Router();
const cors = require("cors");
const path = require("path");
const middleware = require("../middlewares");
const config = require("../config/auth.config");

const Book = require("../models/Book");
books.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/");
  },
  filename: (req, file, callback) => {
    var filename = `${Date.now()}-${file.originalname}`;
    callback(null, filename);
  }
});

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
      id: req.params.id
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

books.get("/generatePdf/:id", async (req, res, next) => {
  const id = req.params.id;
  const documents = await Book.findAll({ where: { id } });
});

books.post(
  "/",
  middleware.checkToken,
  multer({ storage: storage }).single("imgUrl"),
  (req, res) => {
    const filePath = `${req.file.destination}${req.file.filename}`;
    const bookData = {
      name: req.body.name,
      imgUrl: filePath,
      linkUrl: req.body.linkUrl,
      author: req.body.author,
      description: req.body.description
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
  "/uploadpdf/:id",
  middleware.checkToken,
  multer({ storage: storage }).single("filepdf"),
  (req, res) => {
    const filePath =
      "file://" +
      path.join(__dirname).replace("routes", "") +
      `${req.file.path}`;
    if (!filePath) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }
    Book.update(
      {
        filepdf: filePath
      },
      {
        where: {
          id: req.params.id
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
  "/:id",
  middleware.checkToken,
  multer({ storage: storage }).single("imgUrl"),
  (req, res) => {
    const filePath =
      "file://" +
      path.join(__dirname).replace("routes", "") +
      `${req.file.destination}${req.file.filename}`;
    Book.update(
      {
        name: req.body.name,
        imgUrl: filePath,
        linkUrl: req.body.linkUrl,
        author: req.body.author,
        description: req.body.description
      },
      {
        where: {
          id: req.params.id
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
