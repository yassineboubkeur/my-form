const express = require("express");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const http = require("http");
var parseUrl = require("body-parser");
const app = express();

var mysql = require("mysql");
const { encode } = require("punycode");

let encodeUrl = parseUrl.urlencoded({ extended: false });

//session middleware
app.use(
  sessions({
    secret: "thisismysecrctekey",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    resave: false,
  })
);

app.use(cookieParser());

var con = mysql.createConnection({
  host: "localhost",
  user: "root", // my username
  password: "", // my password
  database: "myform",
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.post("/register", encodeUrl, (req, res) => {
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  //var userName = req.body.userName;
  var password = req.body.password;
  var email = req.body.email;

  con.connect(function (err) {
    if (err) {
      console.log(err);
    }
    // checking user already registered or no
    con.query(
      `SELECT * FROM users WHERE email = '${email}' AND password  = '${password}'`,
      function (err, result) {
        if (err) {
          console.log(err);
        }
        if (Object.keys(result).length > 0) {
          res.sendFile(__dirname + "/failReg.html");
        } else {
          //creating user page in userPage function
          function userPage() {
            // We create a session for the dashboard (user page) page and save the user data to this session:
            req.session.user = {
              firstname: firstName,
              lastname: lastName,
              //username: userName,
              password: password,
              email: email,
            };

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Login and register form with Node.js, Express.js and MySQL</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style type="text/css">body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 100vh;
                      background-color: #f5f5f5;
                    }
                    
                    .container {
                      width: 400px;
                      background-color: #fff;
                      padding: 20px;
                      border-radius: 10px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                      text-align: center;
                    }
                    
                    h1 {
                      color: #333;
                      font-size: 28px;
                    }</style>
                </head>
                <body>
                    <div class="container">
                        <h3>Hi, ${req.session.user.firstname} ${req.session.user.lastname} go to login</h3>
                        <a href="/login">Log out</a>
                    </div>
                </body>
                </html>
                `);
          }
          // inserting new user data
          var sql = `INSERT INTO users (firstname, lastname,email, password) VALUES ('${firstName}', '${lastName}', '${email}', '${password}')`;
          con.query(sql, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              // using userPage function for creating user page
              userPage();
            }
          });
        }
      }
    );
  });
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/dashboard", encodeUrl, (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  con.connect(function (err) {
    if (err) {
      console.log(err);
    }
    con.query(
      `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`,
      function (err, result) {
        if (err) {
          console.log(err);
        }

        function userPage() {
          // We create a session for the dashboard (user page) page and save the user data to this session:
          req.session.user = {
            firstname: result[0].firstname,
            lastname: result[0].lastname,
            // username: userName,
            password: password,
            email: email,
          };

          res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Login and register form with Node.js, Express.js and MySQL</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style type="text/css">body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  background-color: #f5f5f5;
                }
                
                .container {
                  width: 400px;
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  text-align: center;
                }
                
                h1 {
                  color: #333;
                  font-size: 28px;
                }</style>
            </head>
            <body>
                <div class="container">
                    <h3>Hi, ${req.session.user.firstname} ${req.session.user.lastname}</h3>
                    <a href="/login">Log out</a>
                </div>
            </body>
            </html>
            `);
        }

        if (Object.keys(result).length > 0) {
          userPage();
        } else {
          res.sendFile(__dirname + "/failLog.html");
        }
      }
    );
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
