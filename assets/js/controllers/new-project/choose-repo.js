define([
    'durandal/app',
    'plugins/router',
    'knockout',
		'models/user',
		'controllers/new-project/index',
		'ko.validate'
  ],

  function (app, router, ko, user, newProjectParent) {

		return {

			/**
			 * local viewmodel properties
			 */
			router: router,

			/**
			 * Activate our model, this method is always called
			 */
			activate: function() {
				var np;
				console.log(newProjectParent);
			},
		}
  });
