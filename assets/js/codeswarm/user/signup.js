define([
  'knockout',
  'request'
],

function(ko, request) {

    var ctor = {

        // Set displayName
        displayName: 'Signup',

        // Setup model
        username: ko.observable(),
        password: ko.observable(),
        confirm_password: ko.observable(),

        // Define request object
        signupRequest: {
          url: '/api/session',
          type: 'POST',
          done: function (data) {
            console.log(data);
          },
          fail: function (err) {
            console.log(err);
          }
        },

        // Login handler method
        trySignup: function () {
          // Check password confirm
          if (this.password() === this.confirm_password()) {
            // Define request payload
            var payload = {
              'username': this.username(),
              'password': this.password()
            };
            // Processes request obj
            request(this.signupRequest, payload);
          } else {
            alert("Your passwords do not match!");
          }
        }

    };
    return ctor;
});