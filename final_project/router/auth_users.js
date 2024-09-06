const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  const existingUser = users.filter((user) =>
    user.username === username  
  );  

  return !!existingUser.length;
}

const authenticatedUser = (username,password) => { 
  const validCredentials = users.filter((user) => {
    if(user.username === username && user.password === password){
      return true;
    }
  });  

  return !!validCredentials.length;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "Invalid request"});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({message: "Invalid credentials"});
  }

  // Generate JWT access token
  let accessToken = jwt.sign({
    data: password
  }, 'access', { expiresIn: 60 * 60 });
  
  // Store access token and username in session
  req.session.authorization = {
      accessToken, username
  }

  return res.status(200).send("Customer successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  if (!review) {
    return res.status(400).json({message: "Invalid request"});
  }

  const username = req.session.authorization.username;
  books[isbn].reviews[username] = review;

  return res.status(200).send("The review for the book with ISBN " + isbn + " has been added/updated");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  const username = req.session.authorization.username;

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "Review not found"});
  }

  delete books[isbn].reviews[username];

  return res.status(200).send("Reviews for the book with ISBN " + isbn + " by the user " + username + " has been deleted");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
