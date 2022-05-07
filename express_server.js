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
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username:req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVar = {username: req.cookies["username"]}
  res.render("urls_new", templateVar);
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
  console.log('Label', req.params.shortURL)
  const longURL = urlDatabase[req.params.shortURL]
  console.log('Label2', longURL)
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL
  console.log('label', req.params.shortURL)
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

app.get("/urls/:id/edit", (req,res) => {
  const shortUrl = req.params.id
  const templateVar = {shortURL: shortUrl, longURL: urlDatabase[shortUrl], username: req.cookies.username}
  console.log(shortUrl)
  console.log("templateVar:", templateVar)
  res.render("urls_show", templateVar)
})

app.post("/urls/:id", (req,res) => {
  const shortUrl = req.params.id
  const userInput = req.body.longURL
  urlDatabase[shortUrl] = userInput
  console.log('label', userInput)
  console.log(shortUrl)
  console.log(urlDatabase)
  res.redirect("/urls")
})

app.post("/login", (req,res) => {
  res.cookie("username", req.body['username'])
  res.redirect("/urls")
})

app.post("/logout", (req,res) => {
  res.clearCookie("username")
  res.redirect("/urls")
})