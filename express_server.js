const express = require("express");
const app = express();
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs")
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

function generateRandomString() {
  let input = 6;
  let characters = '123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
  let temp = [];
  for (let i = 0; i < input; i++) {
    let random = Math.floor(Math.random()*(characters.length))+ 1
  temp.push(characters[random])
  }
  return temp.join('')
}

const emailLookup = function (email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
}

const urlsForUser = function(id) {
  let matches = {}
  for (let key in urlDatabase) {
  if(id === urlDatabase[key].userID) {
    matches[key] = urlDatabase[key].longURL
  }
}
return matches
}

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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  const error = req.session.user_id ? "Please register or login" : null;
const templateVars = { urls:  urlsForUser(req.session.user_id), user:users[req.session.user_id], 
    longURL: urlDatabase[req.params.shortURL], shortURL: req.params.shortURL, userId: req.session.user_id , error: error};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVar = {user: users[req.session['user_id']]}
  if (req.session.user_id) {
    res.render("urls_new", templateVar);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  let error = ''
  const isExist = urlsForUser(req.session.user_id)

  if(!req.session.user_id) {
    error = "Please login or register"
  } else {
    // user is logged in but URL does not exist
    if(!isExist[req.params.shortURL]) {
      error = "You do not have access to this page"
    }
  }

  console.log("Testing label", urlDatabase)
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] || null, user: users[req.session.user_id], error: error };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session['user_id']}
  res.redirect(`/urls/${shortURL}`);         
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

app.get("/urls/:id/edit", (req,res) => {
  const shortUrl = req.params.id
  const templateVar = {shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL, user: users[req.session.user_id], error: null}
  res.render("urls_show", templateVar)
})

app.post("/urls/:id", (req,res) => {
  const shortUrl = req.params.id
  const userInput = req.body.longURL
  urlDatabase[shortUrl] = userInput
  res.redirect("/urls")
})

app.post("/login", (req,res) => {
  let user = emailLookup(req.body.email)
  if(!user) {
    res.statusCode = 403;
    res.send("<h1>Error 403. Email not in system</h1>")
  } else if(bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id
    res.redirect("/urls")
  } else {
      res.statusCode = 403;
      res.send("<h1>Error 403. Incorrect Credentials</h1>")
    }
})

app.post("/logout", (req,res) => {
  res.clearCookie("session")
  res.clearCookie("session.sig")
  res.redirect("/urls")
})

app.get("/register", (req,res) => {
  const templateVars = {user: users[req.session.user_id]}
  res.render("urls_register", templateVars)
})

app.post("/register", (req,res) => {
  if (req.body.email === "") {
    res.statusCode = 400
    res.send("<h1>Error! Please ensure both the email and password sections are properly filled.</h1>")
  }
  else if (req.body.password === "") {
    res.statusCode = 400
    res.send("<h1>Error! Please ensure both the email and password sections are properly filled.</h1>")
  }
  else if (emailLookup(req.body.email)) {
    res.statusCode = 400
    res.send("<h1>Sorry! An account with this email is already in use.</h1>")
  } else {
    let randomId = generateRandomString()
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }
    const hashedPassword = bcrypt.hashSync(users[randomId].password, 10)
  req.session['user_id'] = randomId
  res.redirect("/urls")
  }
  })

  app.get("/login", (req,res) => {
    let templateVars = {user: users[req.session.user_id]}
    res.render("urls_login", templateVars)
  })

