var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
function generateRandomString() {
  let randomString = Math.random().toString(36).replace('0.', '').substring(0,6);
  return randomString;
}
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase ,  username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...

  let longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL : urlDatabase[req.params.id],username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()]=req.body.longURL;
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  if(req.body.newLongURL === undefined){
    res.redirect(`/urls/${req.params.id}`)
  }else{
    urlDatabase[req.params.id] = req.body.newLongURL;
    res.redirect('/urls');
  }
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');

});
app.post("/login", (req, res) => {
  res.cookie('username',req.body.username);
  res.redirect('/urls');

});
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});