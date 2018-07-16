// Userlist data array for filling in info box
var userListData = [];
var host = window.location.host;
var protocol = window.location.protocol;
var url = protocol + host;

// DOM Ready =============================================================
// $(document).ready(function() {


//   // Add User button click
//   $('#btnLogin').on('click', authenticate);


// });

// Functions =============================================================

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function authenticate() {
  var xhttp = new XMLHttpRequest();

  var data = { username: document.getElementById("username").value, password: document.getElementById("password").value }
  if (data.username === '' || data.password === '') {
    document.getElementById("message").innerHTML = "Please fill in all fields!"
  }
  else {
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        var response = JSON.parse(xhttp.responseText);
        document.getElementById("message").innerHTML = "Login successful";
        document.getElementById("token").value = response.token;
        //document.cookie = "jwt-token=" + response.token;
        var redirectUrl = getParameterByName('redirectUrl');
        console.log("redirectUrl: " + redirectUrl);
        if (redirectUrl) {
          console.log('redirecting to : ' + redirectUrl);
          window.location = redirectUrl + '?token=' + response.token;
          //redirect(redirectUrl + '?token=' + response.token);
        }
      }
      if (xhttp.readyState == 4 && xhttp.status == 403) {
        document.getElementById("message").innerHTML = JSON.parse(xhttp.responseText).message;
        document.getElementById("token").value = "";
      }
    };
    console.log(JSON.stringify(data));
    xhttp.open("POST", "/login", true);
    xhttp.setRequestHeader("Content-type", 'application/json; charset=UTF-8');
    xhttp.send(JSON.stringify(data));
  }
}

function verify() {
  var token = document.getElementById("token").value;
  var xhttp = new XMLHttpRequest();
  var data = { token: token };

  if (token.length == 0) {
    document.getElementById("message").innerHTML = "No token entered!"
  }
  else {
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        var response = JSON.parse(xhttp.responseText);
        document.getElementById("message").innerHTML = "Token verified";
        document.getElementById("values").innerHTML = JSON.stringify(response.decoded, null, 2);
        console.log('decoded' + JSON.stringify(response.decoded, null, 2));
      }
      if (xhttp.readyState == 4 && xhttp.status == 403) {
        document.getElementById("message").innerHTML = JSON.parse(xhttp.responseText).message;
        document.getElementById("values").innerHTML = "";
      }
    };
    console.log(JSON.stringify(data));
    xhttp.open("POST", "/verify-token", true);
    xhttp.setRequestHeader("Content-type", 'application/json; charset=UTF-8');
    xhttp.send(JSON.stringify(data));
  }
}

function redirect(url, token) {
  console.log("Inside redirect()");
  var data = null;
  var bearer = "Bearer " + token;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function() {
    console.log('redirect(): readystatechange');
    if (this.readyState === 4) {
      console.log('****************** Redirect: ' + this.responseText);
    }
  });
  xhr.open("GET", url);
  xhr.setRequestHeader("Authorization", bearer);
  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.send(data);
  console.log('redirect(): Exiting');
}
