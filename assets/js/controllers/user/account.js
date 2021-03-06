define([
    'durandal/app',
    'plugins/router',
    'knockout',
		'models/user',
		'ko.validate',
		'gravatar',
  ],

  function (app, router, ko, User) {

		return {

			/**
			 * local viewmodel properties
			 */
			router: router,

			username: ko.observable().extend({required: true, minLength: 3}),
      email: ko.observable(),
			password: ko.observable().extend({required: true, minLength: 3}),
      confirm_password: ko.observable(),
      gravatarUrl: ko.observable('http://www.gravatar.com/avatar/00000000000000000000000000000000?s=120'),

			/**
			 * Activate our model, this method is always called
			 */
			activate: function() {
				self = this;
				// If session active, go home
				User.isLoggedIn(function(isLoggedIn) {
					if(isLoggedIn !== true) {
						router.navigate('user/login');
						return;
					}

					var user = amplify.store.localStorage('user');
					self.username(user.username);
					self.email(user.email);
					if(user.email) 
						self.gravatarUrl(gravatar(user.email,{size: 120}));
				});
			},

			/**
			 * Custom methods
			 */
      cancelBtnClick: function () {
        router.navigateBack();
      },

      frmAccount_Submit: function () {
				// Validate!
				if(this.username.isValid() && this.password.isValid()) {
					var username = this.username(),
							password = this.password();
				}
		  },

			/*
    var ctor = {

      // Check that user is logged in
      canActivate: function () {
			/*
        session.isLoggedIn(function (sess) {
          if (!sess) {
            router.navigate('/user/login');
          }
        });
        // This is required for Durandal
        return true;
      },


      activate: function () {
        this.getSettings();
      },

      // Set displayName
      displayName: 'User Settings',

      // Setup model
      fname: ko.observable(),
      lname: ko.observable(),
      email: ko.observable(),
      password: ko.observable(),
      confirm_password: ko.observable(),
      gravatarUrl: ko.observable('http://www.gravatar.com/avatar/00000000000000000000000000000000?s=120'),

      // Define get-info request object
      getSettingsRequest: {
        url: '/user',
        type: 'GET'
      },

      // Request info to populate model
      getSettings: function () {
        var self = this;
        var req = request(this.getSettingsRequest);
        // Success, populate viewmodel
        req.done(function (data) {
          self.fname(data.fname);
          self.lname(data.lname);
          self.email(data.email);
          self.gravatarUrl(gravatar(data.email, 120));
        });
        // Failure response
        req.fail(function (err) {
          app.showMessage('Error: ' + JSON.parse(err.responseText).message);
          // Send home
          router.navigate('/user');
        });
      },

      // Email change notification
      changeEmailNote: function () {
        app.showMessage('Error: ' + 'Please contact support to change your email');
      },

      // Define save-info request object
      saveSettingsRequest: {
        url: '/user',
        type: 'PUT'
      },

      // Save settings handler method
      trySaveSettings: function () {
        // Ensure all fields (sans email; tested later) contain values

        if (this.fname() === undefined || this.lname() === undefined) {
          app.showMessage('Error: ' + 'Please provide First and Last name and Email');
          return;
        }

        // Test email
        if (!/\S+@\S+\.\S+/.test(this.email())) {
          app.showMessage('Error: ' + 'Invalid email address');
          return;
        }

        // Check password confirm
        if (this.password() !== this.confirm_password()) {
          app.showMessage('Error: ' + 'Your passwords do not match');
          return;
        }

        // ALL TESTS PASSED

        // Define request payload
        var payload = {
          'fname': this.fname(),
          'lname': this.lname(),
          'email': this.email()
        };

        // Check for password change
        if (this.password() !== undefined) {
          payload.password = this.password();
        }

        // Processes request obj
        var req = request(this.saveSettingsRequest, payload);
        req.done(function () {
          app.showMessage('Success: ' + 'Settings successfully saved');
        });
        req.fail(function (err) {
          app.showMessage('Error: ' + JSON.parse(err.responseText).message);
        });

      }

    };
    return ctor;
		*/
		}
  });
