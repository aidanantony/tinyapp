const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieParser())

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
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVar = {user: users[req.cookies["user_id"]]}
  if (req.cookies["user_id"]) {
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
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL;
  let shortUrl = generateRandomString()
  urlDatabase[shortUrl] = longUrl
  res.redirect(longUrl);         
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

app.get("/urls/:id/edit", (req,res) => {
  const shortUrl = req.params.id
  const templateVar = {shortURL: shortUrl, longURL: urlDatabase[shortUrl], user: users[req.cookies["user_id"]]}
  console.log(shortUrl)
  console.log("templateVar:", templateVar)
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
  } else if(req.body.password !== user.password) {
      res.statusCode = 403;
      res.send("<h1>Error 403. Incorrect Credentials</h1>")
    } else {
  res.cookie("user_id", user.id)
  res.redirect("/urls")
    }
})

app.post("/logout", (req,res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})

app.get("/register", (req,res) => {
  const templateVars = {user: users[req.cookies['user_id']]}
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
      password: req.body.password
    }
    console.log(users)
  res.cookie("user_id", randomId)
  res.redirect("/urls")
  }
  })

  app.get("/login", (req,res) => {
    let templateVars = {user: users[req.cookies['user_id']]}
    res.render("urls_login", templateVars)
  })

