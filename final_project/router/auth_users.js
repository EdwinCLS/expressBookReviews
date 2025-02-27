const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secretKey = "797jkh3dljd-2385892743-sdkvhjna";

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const searching = users.find(
    (user) => user.userName === username && user.password === password
  );
  return !!searching;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { userName, password } = req.body;
  const isValidUser = authenticatedUser(userName, password);
  console.log(isValidUser);

  if (!isValidUser) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = jwt.sign({ userName }, secretKey, { expiresIn: "1h" });
  req.session.token = token;
  return res.status(200).json({ message: "Has iniciado sesion", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbNumber = req.params.isbn;
  const { review } = req.body;

  // Verificar que haya una reseña
  if (!review) {
    return res.status(401).json({ message: "Review is required" });
  }

  // Obtener el token de la cabecera Authorization
  const token = req.headers["authorization"];
  const nToken = token.slice(7);

  if (!nToken) {
    return res.status(403).json({ message: "Token is required" });
  }

  // Verificar y decodificar el token para obtener el userName
  jwt.verify(nToken, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Obtener el userName desde el token decodificado
    const userName = decoded.userName;

    let bookFound = false; // Flag para verificar si el libro fue encontrado
    for (let bookId in books) {
      let book = books[bookId];
      if (book.isbn === isbNumber) {
        bookFound = true;

        // Inicializamos las reseñas si no existen
        book.reviews = book.reviews || {};

        book.reviews[userName] = review;

        break;
      }
    }

    if (!bookFound) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res
      .status(200)
      .json({ message: "Review added/updated successfully" });
  });
});

//Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbNumber = req.params.isbn;

  const token = req.headers["authorization"];
  const nToken = token.slice(7);

  if (!nToken) {
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(nToken, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Obtener el userName desde el token decodificado
    const userName = decoded.userName;

    let bookFound = false; // Flag para verificar si el libro fue encontrado
    for (let bookId in books) {
      let book = books[bookId];
      if (book.isbn === isbNumber) {
        bookFound = true;

        // Verificar si el libro tiene reseñas y si el usuario tiene una reseña
        if (book.reviews && book.reviews[userName]) {
          delete book.reviews[userName]; // Eliminar la reseña del usuario
          return res
            .status(200)
            .json({ message: "Review deleted successfully" });
        } else {
          return res
            .status(404)
            .json({ message: "Review not found for this user" });
        }
      }
    }

    if (!bookFound) {
      return res.status(404).json({ message: "Book not found" });
    }
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
