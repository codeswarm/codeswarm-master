define([
    'knockout',
    'request',
    'dom',
    'plugins/router'
  ],

  function (ko, request, dom, router) {

    var ctor = {

      // Set displayName
      displayName: 'User Settings',

      // Setup model
      fname: ko.observable(),
      lname: ko.observable(),
      email: ko.observable(),
      password: ko.observable(),
      confirm_password: ko.observable(),

      // On activate, get info...
      activate: function (context) {
        this.getSettings(context);
      },

      // Define get-info request object
      getSettingsRequest: {
        url: '/user/settings',
        type: 'GET'
      },

      // Request info to populate model
      getSettings: function (user) {
        var self = this;
        var req = request(this.getSettingsRequest, {
          'user': user
        });
        // Success, populate viewmodel
        req.done(function (data) {
          self.fname(data.fname);
          self.lname(data.lname);
          self.email(data.email);
        });
        // Failure response
        req.fail(function (err) {
          dom.showNotification('error', JSON.parse(err.responseText).message);
          // Send home
          router.navigate('');
        });
      },

      // Define save-info request object
      saveSettingsRequest: {
        url: '/user/settings',
        type: 'PUT'
      },

      // Save settings handler method
      trySaveSettings: function () {
        // Ensure all fields (sans email; tested later) contain values
        if (this.fname() === undefined || this.lname() === undefined || this.password() === undefined) {
          dom.showNotification('error', 'Please fill out all fields');
          return;
        }

        // Test email
        if (!/\S+@\S+\.\S+/.test(this.email())) {
          dom.showNotification('error', 'Invalid email address');
          return;
        }

        // Check password confirm
        if (this.password() !== this.confirm_password()) {
          dom.showNotification('error', 'Your passwords do not match');
          return;
        }

        // ALL TESTS PASSED

        // Define request payload
        var payload = {
          'fname': this.fname(),
          'lname': this.lname(),
          'email': this.email(),
          'password': this.password()
        };
        // Processes request obj
        var req = request(this.saveSettingsRequest, payload);
        req.done(function () {
          dom.showNotification('success', 'Settings successfully saved');
        });
        req.fail(function (err) {
          dom.showNotification('error', JSON.parse(err.responseText).message);
        });

      }

    };
    return ctor;
  });
