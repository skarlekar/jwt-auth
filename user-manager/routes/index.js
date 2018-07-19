var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var appConfig = require('../config');
const SECRET = "" + process.env.AUTH_SECRET;
const myAppName = appConfig.appName;


router.use((req, res, next) => {
  var authenticatorUrl = req.authenticatorUrl;
  var appUrl = req.protocol + '://' + req.headers.host;
  var redirectUrl = authenticatorUrl + '?redirectUrl=' + appUrl;

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    console.log('Index Router: Token found. Verifying...');
    //Decode the token
    jwt.verify(token, SECRET, (err, decod) => {
      if (err) {
        console.log("Index Router: Wrong token passed");
        // res.status(403).json({
        //   message: "Wrong Token"
        // });
        res.redirect(redirectUrl);
      }
      else {
        console.log("Index Router: Right token passed");
        //If decoded then call next() so that respective route is called.
        console.log('JWT Decode: ' + JSON.stringify(decod));
        console.log('App Name: ' + myAppName);
        console.log('decod.apps.indexOf(myAppName): ' + decod.apps.indexOf(myAppName));
        if (decod.apps.indexOf(myAppName) == -1) {
          var msg = 'User ' + decod.sub + ' is not authorized for this application: ' + myAppName;
          console.log(msg);
          //res.status(403).json({ message: msg });
          res.status(403);
          res.render('error', { message: msg, error: {status: 403, stack: 'none'} })
        }
        else {
          req.decoded = decod;
          next();
        }
      }
    });
  }
  else {
    console.log("Index Router: No token passed");
    // res.status(403).json({
    //   message: "No Token"
    // });
    //res.redirect('http://ec2-18-205-50-66.compute-1.amazonaws.com:8081/?redirectUrl=http://ec2-18-205-50-66.compute-1.amazonaws.com:8082');
    res.redirect(redirectUrl);
  }
})

/* GET home page. */
router.get('/', function(req, res, next) {
  var decod = req.decoded;
  res.render('index-admin', { title: 'User Management Service', 'apps': appConfig.apps, 'admin': decod.admin });
});

module.exports = router;
