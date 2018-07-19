var express = require('express');
var appConfig = require('../config');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bCrypt = require('bcrypt-nodejs');
const bodyParser = require("body-parser");
const SECRET = "" + process.env.AUTH_SECRET;
const COLLECTION = 'userlist';
const uuidv1 = require('uuid/v1')

// Generates hash using bCrypt
var createHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// Compare user entered password with the one in the database
var isValidPassword = function(entered, stored) {
    return bCrypt.compareSync(entered, stored);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Authentication Service' });
});

/* GET Render the New User page. */
router.get('/verify', function(req, res) {
    console.log('req.headers = ' + JSON.stringify(req.headers));
    console.log('req.query = ' + JSON.stringify(req.query));
    console.log('req.query.token = ' + JSON.stringify(req.query.token));
    var token =  req.query.token;
    if (token) {
        console.log('token: ' + token);
    } else {
        token = '';
        console.log('No token passed');
    }
    res.render('verify', { title: 'Authentication Service', token: token });
});

/* POST to verify-token */
router.post('/verify-token', function(req, res) {
    console.log('Inside verify-token');
    var token = req.body.token;
    console.log('token :' + token);
    
    //Decode the token
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
          var errorMesssage = err.name + ' : ' + err.message;
        console.log(errorMesssage);
        res.status(403).json({
          message: errorMesssage
        });
      }
      else {
        console.log("Right token passed");
        //If decoded then call next() so that respective route is called.
        res.status(200).json({decoded});
      }
    });
  
    console.log('Exiting verify-token');
})


/* POST to authenticate user */
router.post('/login', function(req, res) {
    console.log("Request arrived");
    console.log("Secret: " + SECRET);
    var message;
    var token;
    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var password = req.body.password;
    console.log("username: " + userName);

    // Set our collection
    //var collection = db.get(COLLECTION);
    var collection = db.get('userlist');
    console.log("collection initiated ");

    var query = { username: req.body.username };
    collection.find(query, {}, function(err, result) {
        if (err) {
            console.log("Error: " + err);
            throw err;
        }
        if (result.length == 0) {
            console.log('No such user found');
            message = 'No such user found';
            res.status(403).json({
                message
            });
        }
        else {
            console.log("Resultset:{" + JSON.stringify(result) + "}");
            console.log("Going to compare passwords");
            var storedPassword = result[0].password;
            console.log("Retrieved password from result is: " + storedPassword);
            if (!isValidPassword(req.body.password, storedPassword)) {
                console.log("Wrong password entered");
                message = "Wrong Password";
                res.status(403).json({
                    message
                });
            }
            else {
                console.log("Correct password passed");
                //create the token.
                var user = {};
                user['email'] = result[0].email;
                user['given_name'] = result[0].firstname;
                user['family_name'] = result[0].lastname;
                user['org'] = result[0].org;
                user['admin'] = result[0].adminUser;
                user['apps'] = result[0].authorizedApps;
                user['username'] = req.body.username;
                user['timestamp'] = Date.now();
                var audience = appConfig.audience;
                var issuer = appConfig.issuer;
                var uid = uuidv1();
                token = jwt.sign(user, SECRET, {'subject': req.body.username, 'expiresIn': '1h', 'audience': audience, 'issuer': issuer, 'jwtid': uid});
                message = "Login Successful";

                //If token was created, pass the token to client else send respective message
                if (token) {
                    console.log("JWT: " + token);
                    res.status(200).json({
                        message,
                        token
                    });
                }
                else {
                    res.status(403).json({
                        message
                    });
                }
            }
        }
        db.close();
    });
});

module.exports = router;
