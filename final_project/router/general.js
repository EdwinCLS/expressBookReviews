const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  const { userName, password } = req.body;

  if (!userName) {
    return res.status(402).json({ message: "Username is required" });
  }
  if (!password) {
    return res.status(402).json({ message: "Password is required" });
  }

  const verified = users.find((usuario) => usuario.userName === userName);

  if (verified) {
    return res.status(402).json({ message: "User already exists" });
  }

  users.push({ userName, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbNumber = req.params.isbn;
  getBookByISBN(isbNumber)
    .then((book) => res.send(book))
    .catch((err) => console.error(err));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  const authName = req.params.author;

  getByAuthor(authName)
    .then((book) => res.send(book))
    .catch((err) => console.error(err));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  const titleName = req.params.title;
  getByTitle(titleName)
    .then((book) => res.send(book))
    .catch((err) => console.error(err));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbNumber = req.params.isbn;
  console.log(isbNumber);

  for (let isbNum in books) {
    if (books[isbNum].isbn === isbNumber) {
      return res.send(books[isbNum].reviews);
    }
  }
  return res.status(402).json({ message: "The review is not found" });
});

async function getAllBooks() {
  try {
    const response = await axios.get("http://localhost:5000/");
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getBookByISBN(isbn) {
  for (let bookName in books) {
    if (books[bookName].isbn === isbn) {
      return books[bookName];
    }
  }
}

async function getByAuthor(author) {
  for (let bookAuth in books) {
    if (books[bookAuth].author === author) {
      return books[bookAuth];
    }
  }
}

async function getByTitle(title) {
  for (let bookTitle in books) {
    if (books[bookTitle].title === title) {
      return books[bookTitle];
    }
  }
}
module.exports.general = public_users;
