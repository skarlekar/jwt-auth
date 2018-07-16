var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const SECRET = "" + process.env.AUTH_SECRET;


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
        req.decoded = decod;
        next();
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
  res.render('index', { title: 'User Management Service' });
});

module.exports = router;
