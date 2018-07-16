var express = require('express');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

const SECRET = "" + process.env.AUTH_SECRET;

// Generates hash using bCrypt
var createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// Compare user entered password with the one in the database
var isValidPassword = function(entered, stored) {
  return bCrypt.compareSync(entered, stored);
}

/* GET userlist. */
router.get('/userlist', function(req, res) {
  var db = req.db;
  var collection = db.get('userlist');
  collection.find({}, {}, function(e, docs) {
    console.log("Userlist: "+ JSON.stringify(docs, null, 2));
    res.json(docs);
  });
});

/* POST to adduser. */
router.post('/adduser', function(req, res) {
  console.log("Inside /adduser route");
  //console.log("Body: " + JSON.stringify(req.body, null, 2));
  var body = req.body;
  var password = body.password;
  var verify = body.verifypassword;
  console.log("password=" + password);
  console.log("verify=" + verify);
  if (password == verify) {
    console.log("Passwords are the same");
    var hash = createHash(password);
    console.log("Password hash is: " + hash);
    body["password"] = hash;
    delete body.verifypassword;
    console.log("Body: " + JSON.stringify(req.body, null, 2));
  }
  else {
    console.log("Passwords are not the same");
    res.send({ msg: 'Password strings are not the same' });
    return;
  }
  var db = req.db;
  var collection = db.get('userlist');
  collection.insert(body, function(err, result) {
    console.log("New user inserted");
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );
  });
});

/* DELETE to deleteuser. */
router.delete('/deleteuser/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('userlist');
  var userToDelete = req.params.id;
  collection.remove({ '_id': userToDelete }, function(err) {
    res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
  });
});

module.exports = router;
