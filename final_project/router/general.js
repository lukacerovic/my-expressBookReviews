const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');


// Check if username already exists
function doesExist(username) {
    return users.some(user => user.username === username);
  }
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (doesExist(username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    users.push({ username: username, password: password });
    return res.status(200).json({ message: "Successful registration" });
});

// Login as a registered user
public_users.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const user = users.find(user => user.username === username && user.password === password);
  
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  
    // Generate JWT token
    const token = jwt.sign({ username: user.username }, 'your_secret_key');
  
    return res.status(200).json({ message: "Successful login", token: token });
});


// Get the book list available in the shop
//public_users.get('/',function (req, res) {
  //res.send(JSON.stringify(books,null,4));
  //return res.status(300).json({message: "Yet to be implemented"});
//});

// promise TASK 10
public_users.get('/', function (req, res) {
    axios.get('https://lukacerovic1-5000.theiadocker-3-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai')
      .then(response => {
        res.send(JSON.stringify(response.data, null, 4));
      })
      .catch(error => {
        return res.status(500).json({ message: "Error fetching book list" });
      });
  });
  
  

// Get book details based on ISBN
//public_users.get('/isbn/:isbn',function (req, res) {
    //const isbn = req.params.isbn;

    // Check if the book with the provided ISBN exists
    //if (books.hasOwnProperty(isbn)) {
      //const book = books[isbn];
      //return res.status(200).json({ book });
    //} else {
     // return res.status(404).json({ message: "Book not found" });
   // }
 //});

//TASK 11
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    axios.get(`https://lukacerovic1-5000.theiadocker-3-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/book/${isbn}`)
      .then(response => {
        const book = response.data;
        return res.status(200).json({ book });
      })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          return res.status(404).json({ message: "Book not found" });
        } else {
          return res.status(500).json({ message: "Error fetching book details" });
        }
      });
});
  
  
// Get book details based on author
//public_users.get('/author/:author',function (req, res) {
//  const author = req.params.author;
//  const foundBooks = [];

  // Iterate through all books
  //for (const isbn in books) {
    //if (books.hasOwnProperty(isbn)) {
      //const book = books[isbn];
      //if (book.author.toLowerCase() === author.toLowerCase()) {
        //foundBooks.push({ isbn, ...book });
      //}
    //}
  //}

  // Check if any books by the author were found
  //if (foundBooks.length > 0) {
    //return res.status(200).json({ books: foundBooks });
  //} else {
    //return res.status(404).json({ message: "No books found by the author" });
  //}
//});

//TASK 12
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
  
    axios.get(`https://lukacerovic1-5000.theiadocker-3-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books?author=${author}`)
      .then(response => {
        const foundBooks = response.data;
        if (foundBooks.length > 0) {
          return res.status(200).json({ books: foundBooks });
        } else {
          return res.status(404).json({ message: "No books found by the author" });
        }
      })
      .catch(error => {
        return res.status(500).json({ message: "Error fetching book details" });
      });
});
  

// Get all books based on title
//public_users.get('/title/:title',function (req, res) {
//    const title = req.params.title;
//    const foundBooks = [];
  
    // Iterate through all books
    //for (const isbn in books) {
      //if (books.hasOwnProperty(isbn)) {
        //const book = books[isbn];
        //if (book.title.toLowerCase() === title.toLowerCase()) {
          //foundBooks.push({ isbn, ...book });
        //}
      //}
    //}
  
    // Check if any books by the title were found
    //if (foundBooks.length > 0) {
      //return res.status(200).json({ books: foundBooks });
    //} else {
      //return res.status(404).json({ message: "No books found by the title" });
    //}
//});

//TASK 13
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
  
    axios.get(`https://lukacerovic1-5000.theiadocker-3-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books?title=${title}`)
      .then(response => {
        const foundBooks = response.data;
        if (foundBooks.length > 0) {
          return res.status(200).json({ books: foundBooks });
        } else {
          return res.status(404).json({ message: "No books found by the title" });
        }
      })
      .catch(error => {
        return res.status(500).json({ message: "Error fetching book details" });
      });
});
  

// Get book review based on ISBN
public_users.get('/review/:isbn', function(req, res) {
    const isbn = req.params.isbn;
  
    // Check if the book with the provided ISBN exists
    if (books.hasOwnProperty(isbn)) {
      const book = books[isbn];
  
      // Check if the book has any reviews
      if (Object.keys(book.reviews).length > 0) {
        return res.status(200).json({ reviews: book.reviews });
      } else {
        return res.status(404).json({ message: "No reviews found for the book" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

// Add or modify a book review
public_users.post('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user.username; // Pretpostavljamo da je korisnik prijavljen i postoji req.user objekat s podacima o korisniku
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Provjeravamo da li postoji recenzija od strane trenutnog korisnika
    if (books[isbn].reviews[username]) {
      // Ako postoji, ažuriramo postojeću recenziju
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // Ako ne postoji, dodajemo novu recenziju
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully" });
    }
});

public_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // Provjerite da li korisnik ima pristupni token
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Access denied. Missing token." });
    }
  
    try {
      // Izvucite korisničko ime iz pristupnog tokena
      const decodedToken = jwt.verify(token.split(" ")[1], "your_secret_key");
      const username = decodedToken.username;
  
      // Provjerite da li korisnik ima recenziju za dati ISBN broj knjige
      if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
      }
  
      // Obrišite recenziju korisnika za dati ISBN broj knjige
      delete books[isbn].reviews[username];
  
      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
});




module.exports.general = public_users;


  
  
  
