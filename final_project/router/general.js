const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Invalid request"});
  }

  if (isValid(username)) {
    return res.status(400).json({message: "User already exists"});
  }

  users.push({
    username,
    password
  });

  return res.status(200).json({message: "Customer registered successfully. Please login to continue"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const fetchingBooks = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject({});
    }
  });
  
  fetchingBooks
    .then((books) => {
      return res.status(200).json(books);
    })
    .catch((error) => {
      return res.status(404).json({message: "Books not found"});
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const fetchingBooks = new Promise((resolve, reject) => {
    if (books[req.params.isbn]) {
      resolve(books[req.params.isbn]);
    } else {
      reject({});
    }
  });

  fetchingBooks
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((error) => {
      return res.status(404).json({message: "Book not found"});
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const fetchingBooks = new Promise((resolve, reject) => {
    const author = req.params.author;

    const bookKeys = Object.keys(books);
    const authorBooksIsbn = bookKeys.filter((isbn) => {
      return books[isbn].author === author;
    });

    if (authorBooksIsbn.length === 0) {
      reject({});
    }

    const authorBooks = authorBooksIsbn.map((isbn) => {
      return books[isbn];
    });

    resolve(authorBooks);
  });

  fetchingBooks
    .then((books) => {
      return res.status(200).json({booksByAuthor: books});
    })
    .catch((error) => {
      return res.status(404).json({message: "Author not found"});
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const fetchingBooks = new Promise((resolve, reject) => {
    const title = req.params.title;

    const bookKeys = Object.keys(books);
    const titleBooksIsbn = bookKeys.filter((isbn) => {
      return books[isbn].title === title;
    });

    if (titleBooksIsbn.length === 0) {
      reject({});
    }

    const titleBooks = titleBooksIsbn.map((isbn) => {
      return books[isbn];
    });

    resolve(titleBooks);
  });

  fetchingBooks
    .then((books) => {
      return res.status(200).json({booksByTitle: books});
    })
    .catch((error) => {
      return res.status(404).json({message: "Title not found"});
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json({review: books[isbn].review});
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
