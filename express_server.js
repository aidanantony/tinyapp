const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Requiring the helper functions from helper.js
const { getUserByEmail } = require("./helper");

//The function that generates the Short URL.
const generateRandomString = function() {
  let input = 6;
  let characters = '123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
  let temp = [];
  for (let i = 0; i < input; i++) {
    let random = Math.floor(Math.random() * (characters.length)) + 1;
    temp.push(characters[random]);
  }
  return temp.join('');
};

const urlsForUser = function(id) {
  let matches = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      matches[key] = urlDatabase[key].longURL;
    }
  }
  return matches;
};

//The Databse that URLs are stored in.
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
//The users database with a placeholder user
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$bMHVYWy7szrTSH9AIb.eb.W165rhYiXISWb/awDHbBx4JzleOJgXy"
  },
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//The get route for the main page. Has a condition to check if user is logged in. If not user redirected to login
app.get("/urls", (req, res) => {
  const templateVars = { urls:  urlsForUser(req.session.user_id), user:users[req.session.user_id] };
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});
  

app.get("/", (req, res) => {
  res.send('Welcome!')
});

//The get route for the Create New Urls page. If not logged in, will redirect user to login page.
app.get("/urls/new", (req, res) => {
  let templateVar = {user: users[req.session['user_id']]};
  if (req.session.user_id) {
    res.render("urls_new", templateVar);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  const isExist = urlsForUser(req.session.user_id);
  // If user is not loggeed in and tries to reach the edit page of a URL.
  if (!req.session.user_id) {
    return res.status(401).send('Please login or register')
  } 
    // user is logged in but URL does not exist
  if (!isExist[req.params.shortURL]) {
    return res.status(401).send('You do not have access to this page')
  }
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
  console.log("longURL", urlDatabase[req.params.shortURL].longURL)
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session['user_id']};
  res.redirect(`/urls/${shortURL}`);
});

//The route for our shortURL. It redirects to our longURL that was shortened.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req,res) => {
  const shortUrl = req.params.id;
  const templateVar = {shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL, user: users[req.session.user_id], error: null};
  res.render("urls_show", templateVar);
});

app.post("/urls/:id", (req,res) => {
  if(!req.session.user_id) {
    return res.statusCode(401).send('You are not authorized')
  }
  if(req.body.longURL === '') {
    return res.statusCode(401).send('Long Url can not be empty')
  }
  const shortUrl = req.params.id;
  const userInput = req.body.longURL;
  urlDatabase[shortUrl].longURL = userInput;
  console.log(userInput)
  res.redirect("/urls");
});
//Login page post route. Has checks for if email is not in system or if incorrect password.
app.post("/login", (req,res) => {
  let user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.statusCode = 403;
    res.send("<h1>Error 403. Email not in system</h1>");
  } else if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.send("<h1>Error 403. Incorrect Credentials</h1>");
  }
});
//This clears the cookies once a user has logged out.
app.post("/logout", (req,res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/urls");
});

app.get("/register", (req,res) => {
  const templateVars = {user: users[req.session.user_id]};
  res.render("urls_register", templateVars);
});
//Register route with conditional checks to ensure all necessary requirments are met.
app.post("/register", (req,res) => {
  if (req.body.email === "") {
    res.statusCode = 400;
    res.send("<h1>Error! Please ensure both the email and password sections are properly filled.</h1>");
  } else if (req.body.password === "") {
    res.statusCode = 400;
    res.send("<h1>Error! Please ensure both the email and password sections are properly filled.</h1>");
  } else if (getUserByEmail(req.body.email, users)) {
    res.statusCode = 400;
    res.send("<h1>Sorry! An account with this email is already in use.</h1>");
  } else {
    let randomId = generateRandomString();
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session['user_id'] = randomId;
    res.redirect("/urls");
  }
});

app.get("/login", (req,res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

