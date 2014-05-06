/* global requirejs:true */
require.config({
	baseUrl: 'js',
	paths: {
    'controllers': 'controllers',
    'routes': 'routes',

		'utils': 'utils',
		'request': 'utils/request',

		'durandal': 'vendor/durandal/js',
		'plugins': 'vendor/durandal/js/plugins',
		'transitions': 'vendor/durandal/js/transitions',

		'amplify': 'vendor/amplify/lib/amplify.min',
		'ansi_up': 'vendor/ansi_up/ansi_up',
		'async': 'vendor/async/lib/async',
		'base64': 'vendor/base64/base64.min',
		'github': 'vendor/github/github',
		'gravatar': 'vendor/gravatarjs/gravatar',
		'handlebars': 'vendor/handlebars/handlebars.min',
		'jquery': 'vendor/jquery/dist/jquery.min',
		'knockout': 'vendor/knockout.js/knockout',
		'postal': 'vendor/postal.js/lib/postal.min',
		'socketio': 'sails.io.js',
		'text': 'vendor/requirejs-text/text',
		'underscore': 'vendor/underscore/underscore'
	},
	shim: {
		'handlebars': {
			'exports': 'Handlebars'
		},
		'socketio': {
			exports: 'io'
		},
		'underscore': {
			exports: '_'
		}
	}
});

