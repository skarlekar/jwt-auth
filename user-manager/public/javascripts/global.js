// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

  // Populate the user table on initial page load
  populateTable();

  // Username link click
  $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

  // Add User button click
  $('#btnAddUser').on('click', addUser);

  // Delete User link click
  $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

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

    // Inject the whole content string into our existing HTML table
    $('#userList table tbody').html(tableContent);
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

  // Retrieve values
  var username = (thisUserObject.username) ? thisUserObject.username : '';
  var firstname = (thisUserObject.firstname) ? thisUserObject.firstname : '';
  var lastname = (thisUserObject.lastname) ? thisUserObject.lastname : '';
  var email = (thisUserObject.email) ? thisUserObject.email : '';
  var age = (thisUserObject.age) ? thisUserObject.age : '';
  var gender = (thisUserObject.gender) ? thisUserObject.gender : '';
  var location = (thisUserObject.location) ? thisUserObject.location : '';

  //Populate Info Box
  $('#userInfoUserName').text(username);
  $('#userInfoFirstName').text(firstname);
  $('#userInfoLastName').text(lastname);
  $('#userInfoEmail').text(email);
  $('#userInfoAge').text(age);
  $('#userInfoGender').text(gender);
  $('#userInfoLocation').text(location);
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
    if ($(this).val() === '') { errorCount++; }
  });

  // Check and make sure errorCount's still at zero
  if (errorCount === 0) {

    // If it is, compile all user info into one object
    var newUser = {
      'username': trim($('#addUser fieldset input#inputUserName').val()),
      'email': trim($('#addUser fieldset input#inputUserEmail').val()),
      'firstname': trim($('#addUser fieldset input#inputUserFirstname').val()),
      'lastname': trim($('#addUser fieldset input#inputUserLastname').val()),
      'age': trim($('#addUser fieldset input#inputUserAge').val()),
      'location': trim($('#addUser fieldset input#inputUserLocation').val()),
      'gender': trim($('#addUser fieldset input#inputUserGender').val()),
      'password': trim($('#addUser fieldset input#inputPassword').val()),
      'verifypassword': trim($('#addUser fieldset input#inputVerifyPassword').val())
    }

    var token = getParameterByName('token');
    var addUserUrl = '/users/adduser?token=' + token;
    // Use AJAX to post the object to our adduser service
    $.ajax({
      type: 'POST',
      data: newUser,
      url: addUserUrl,
      dataType: 'JSON'
    }).done(function(response) {

      // Check for successful (blank) response
      if (response.msg === '') {

        // Clear the form inputs
        $('#addUser fieldset input').val('');

        // Update the table
        populateTable();

      }
      else {

        // If something goes wrong, alert the error message that our service returned
        alert('Error: ' + response.msg);

      }
    });
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
