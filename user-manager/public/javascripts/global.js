// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

  // Populate the user table on initial page load
  populateTable();

  // Username link click
  //$('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
  $('#user-summary-tbody').on('click', 'td a.linkshowuser', showUserInfo);

  // Add User button click
  $('#btnAddUser').on('click', addUser);

  // Delete User link click
  //$('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
  $('#user-summary-tbody').on('click', 'td a.linkdeleteuser', deleteUser);

});

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


// Fill table with data
function populateTable() {

  // Empty content string
  var tableContent = '';
  var token = getParameterByName('token');
  var userListUrl = '/users/userlist?token=' + token;

  // jQuery AJAX call for JSON
  $.getJSON(userListUrl, function(data) {
    // Stick our user data array into a userlist variable in the global object
    userListData = data;

    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function() {
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
      tableContent += '<td>' + this.email + '</td>';
      tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
      tableContent += '</tr>';
    });

    document.getElementById('user-summary-tbody').innerHTML = tableContent;
    // Inject the whole content string into our existing HTML table
    //$('#userList table tbody').html(tableContent);
  });
};

// Show User Info
function showUserInfo(event) {
  // Prevent Link from Firing
  event.preventDefault();

  // Retrieve username from link rel attribute
  var thisUserName = $(this).attr('rel');

  // Get Index of object based on id value
  var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

  // Get our User Object
  var thisUserObject = userListData[arrayPosition];

  console.log('thisUserObject: ' + JSON.stringify(thisUserObject));

  // Retrieve values
  var username = (thisUserObject.username) ? thisUserObject.username : '';
  var firstname = (thisUserObject.firstname) ? thisUserObject.firstname : '';
  var lastname = (thisUserObject.lastname) ? thisUserObject.lastname : '';
  var email = (thisUserObject.email) ? thisUserObject.email : '';
  var org = (thisUserObject.org) ? thisUserObject.org : '';
  var authorizedApps = thisUserObject['authorizedApps'];
  var authorized = '';
  var mfa = (thisUserObject.mfa) ? thisUserObject.mfa : '';
  var otpAuthUrl = (thisUserObject.otpAuthUrl) ? thisUserObject.otpAuthUrl : '';
  var admin = (thisUserObject.adminUser) ? thisUserObject.adminUser : '';
  var canvas = document.getElementById('qrCodeImage');

  if ((authorizedApps) && (authorizedApps != 'null'))
    for (var i = 0, len = authorizedApps.length; i < len; i++) {
      authorized = authorized + ((i > 0) ? ', ' : '');
      authorized = authorized + authorizedApps[i];
    }

  if (otpAuthUrl != '') {
    QRCode.toCanvas(canvas, otpAuthUrl, function(error) {
      if (error) {
        console.error('Could not paint QR code: ' + error);
      }
      else {
        console.log('Painted QR code successfully!');
      }
    });
  }
  else {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  //Populate Info Box
  $('#userInfoUserName').text(username);
  $('#userInfoFirstName').text(firstname);
  $('#userInfoLastName').text(lastname);
  $('#userInfoEmail').text(email);
  $('#userInfoOrg').text(org);
  $('#userInfoAdmin').text(admin);
  $('#enableMFA').text(mfa);
  $('#otpAuthUrl').text(otpAuthUrl);
  $('#userInfoAuthorizedApps').text(authorized);
};

function trim(value) {
  var trimmed = (value) ? value.trim() : '';
  return trimmed;
}

// Add User
function addUser(event) {
  event.preventDefault();

  // Super basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#addUser input').each(function(index, val) {
    if ($(this).val() === '' && ($(this).attr('id') != 'adminUser' || $(this).attr('id') != 'enableMFA')) { errorCount++; }
  });

  console.log('ErrorCount: ' + errorCount);

  // Check and make sure errorCount's still at zero
  if (errorCount === 0) {

    var adminUser = $('#addUser fieldset input#adminUser').is(":checked");
    var mfa = $('#addUser fieldset input#enableMFA').is(":checked");
    var appsVal = "" + $("#authorizedApps").val();
    var authorizedApps = appsVal.split(',');

    console.log('Authorized apps: ' + authorizedApps);

    // If it is, compile all user info into one object
    var newUser = {
      username: trim($('#addUser fieldset input#inputUserName').val()),
      email: trim($('#addUser fieldset input#inputUserEmail').val()),
      firstname: trim($('#addUser fieldset input#inputUserFirstname').val()),
      lastname: trim($('#addUser fieldset input#inputUserLastname').val()),
      org: trim($('#addUser fieldset input#inputUserOrganization').val()),
      password: trim($('#addUser fieldset input#inputPassword').val()),
      verifypassword: trim($('#addUser fieldset input#inputVerifyPassword').val()),
      adminUser: adminUser,
      mfa: mfa,
      authorizedApps: authorizedApps
    }

    var token = getParameterByName('token');
    var addUserUrl = '/users/adduser?token=' + token;
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        var response = JSON.parse(xhttp.responseText);
        // Clear the form inputs
        console.log("User add was successful")
        $('#addUser fieldset input').val('');
        // Update the table
        populateTable();
      }
      if (xhttp.readyState == 4 && xhttp.status != 200) {
        console.log("User add failed with error: " + response.msg);
        alert('Error: ' + response.msg);
      }
    };
    xhttp.open("POST", addUserUrl, true);
    xhttp.setRequestHeader("Content-type", 'application/json; charset=UTF-8');
    xhttp.send(JSON.stringify(newUser));
    // XHR ends here
  }
  else {
    // If errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

// Delete User
function deleteUser(event) {

  event.preventDefault();

  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this user?');
  var token = getParameterByName('token');

  // Check and make sure the user confirmed
  if (confirmation === true) {

    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/users/deleteuser/' + $(this).attr('rel') + '?token=' + token
    }).done(function(response) {

      // Check for a successful (blank) response
      if (response.msg === '') {}
      else {
        alert('Error: ' + response.msg);
      }

      // Update the table
      populateTable();

    });

  }
  else {

    // If they said no to the confirm, do nothing
    return false;

  }

};
