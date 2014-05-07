define(['amplify'],function(require) {
	amplify.request.define('user','ajax',{
		url: '/user',
		type: 'GET'
	});

	amplify.request.define('user.create','ajax',{
		url: '/user',
		type: 'POST'
	});

	amplify.request.define('user.login','ajax',{
		url: '/session',
		type: 'POST'
	});

	amplify.request.define('user.session','ajax',{
		url: '/session',
		type: 'GET'
	});

	amplify.request.define('user.session.end','ajax',{
		url: '/session',
		type: 'DELETE'
	});

	return {
		// Public Methods
		isLoggedIn: function(cb) {
			// Refresh the session for good measure
			amplify.request({
				resourceId: 'user.session',
				success: function(data) {
					// Set local session
					amplify.store.sessionStorage('cs_sid',data.session);
					amplify.publish('user.loggedIn',true);
					if(cb) cb(true);
				},
				error: function() {
					// Clear local session
					amplify.store.sessionStorage('cs_sid',null);
					amplify.publish('user.loggedIn',false);
					if(cb) cb(false);
				}
			});
		},
		tryLogin: function(username, password, cb) {
			amplify.request({
				resourceId: 'user.login',
				data: {
					'username': username,
					'password': password
				},
				success: function(data) {
					// Store the credentials
					amplify.store.sessionStorage('cs_sid',data.session);
					amplify.store.localStorage('user',data.user);

					amplify.publish('user.loggedIn',true);
					cb(true);
				},
				error: function(data) {
					// Clear local session
					amplify.store.sessionStorage('cs_sid','');
					amplify.publish('user.loggedIn',false);
					cb(false);
				}
			});
		},
		tryLogout: function(cb) {
			amplify.request({
				resourceId: 'user.session.end',
				success: function(data) {
					amplify.store.sessionStorage('cs_sid','');
					amplify.publish('user.loggedIn',false);
					if(cb) cb();
				},
				error: function(data) {
					amplify.store.sessionStorage('cs_sid','');
					amplify.publish('user.loggedIn',false);
					if(cb) cb();
				}
			});
		}
	};
});
