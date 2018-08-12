var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['rames','susma','motto'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
function generateRandomString() {
  let randomString = Math.random().toString(36).replace('0.', '').substring(0,6);
  return randomString;
}
var urlDatabase = {
  "b2xVn2": { shortURL : "b2xVn2", longURL :"http://www.lighthouselabs.ca" , userID : "b6bbi4" },

  "9sm5xK": { shortURL : "9sm5xK", longURL : "http://www.google.com" , userID : "mi6uc" }
};
const users = {
  "b6bbi4": {
    id: "b6bbi4",
    email: "susma@gmail.com",
    password: "purple"
  },
 "mi6uc": {
    id: "mi6uc",
    email: "rames@yahoo.com",
    password: "dishwasher"
  }
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {

  let urlDatabaseforUser = [];
  if(req.session.user_id){
   Object.keys(urlDatabase).forEach(key => {
    if(urlDatabase[key].userID === req.session.user_id){
       urlDatabaseforUser.push(urlDatabase[key]);
     }
    });
       let templateVars ={ urlData : urlDatabaseforUser , user : users[req.session.user_id]};
       res.render("urls_index", templateVars);
    }else{
    res.redirect('/login');
  }
});
app.get("/urls/new", (req, res) => {
  if(req.session.user_id){
    let templateVars = { user : users[req.session.user_id] };
    res.render("urls_new",templateVars);
  }else{
    res.render('urls_login');
  }
});
app.get("/register", (req, res) => {
  res.render("urls_registration");
});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL : urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  if(req.session.user_id){
    res.redirect("/urls");
  }else{
    res.render("urls_login");
   }
});
app.post("/urls", (req, res) => {
  let shortId = generateRandomString();
  let url = { shortURL : "" , longURL : "" , userID : ""};
  url.shortURL=shortId;
  url.longURL = req.body.longURL;
  url.userID = req.session.user_id;
  urlDatabase[shortId] = url;
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  if(req.body.newLongURL === undefined){
    res.redirect(`/urls/${req.params.id}`)
  }else{
    urlDatabase[req.params.id].longURL = req.body.newLongURL;
    res.redirect('/urls');
  }
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');

});
app.post("/login", (req, res) => {
  if(isValidUser(req.body.email , req.body.password,req)){
    res.redirect('/urls');
  }else{
    res.sendStatus(403);
  }

});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');

});
app.post("/register", (req, res) => {
  let userId = generateRandomString();
  if(req.body.email === "" || req.body.password === "" || isExistingUser(req.body.email)){
    res.sendStatus(400);
  }else{
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userId] = {
      id: userId ,
      email: req.body.email,
      password: hashedPassword
    }
    req.session.user_id = userId;
    users[userId].id = req.session.user_id;
    res.redirect('/urls');
   }
});
function isExistingUser(email){
  let userFound = false ;
  Object.keys(users).forEach(key => {
    if(users[key].email === email){
      userFound = true;
      return;
    }
  });
  return userFound;
}
function isValidUser(email,password,req){
  let userFound = false ;
  Object.keys(users).forEach(key => {
    if(users[key].email === email && bcrypt.compareSync(password, users[key].password)){
      userFound = true;
      req.session.user_id = key;
      return;
    }
  });
  return userFound;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});