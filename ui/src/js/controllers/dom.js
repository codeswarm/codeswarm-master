define([
		"jquery",
		"handlebars",
		"controllers/timestamp",
		"text!templates/header.tpl",
		"text!templates/login.tpl",
		"text!templates/menu.tpl",
		"text!templates/projects.tpl",
		"text!templates/project.tpl",
		"text!templates/logs.tpl",
		"text!templates/logview.tpl",
		"text!templates/tokens.tpl"
	],
	function ($, Handlebars, timestamp, header, login, menu, projects, project, logs, logview, tokens) {

		var dom = {

			loaded: false,

			// Cached els
			$window: null,
			$header: null,
			$menu: null,
			$menubutton: null,
			$shadowblock: null,
			$main: null,
			$notification: null,

			// Named els
			login: "#login",

			init: function () {

				// Cache elements
				this.$window = $(window);
				this.$header = $("header");
				this.$menu = $("aside");
				this.$main = $("#main");
				this.$notification = $("#notification");

				// Initialize methods
				this.loadHeader();
				this.floatHeader();

			},

			/**
			 * Load the header contents
			 */
			loadHeader: function (auth) {
				var template = Handlebars.compile(header),
					html = template({
						auth: auth
					});
				this.$header.html(html);
				if (auth) {
					this.bindMenu();
				} else {
					this.hideMenu();
				}
				this.$shadowblock = this.$header.find("#shadow-block");
			},

			/**
			 * Load the menu contents
			 */
			loadMenu: function () {
				var self = this,
					template = Handlebars.compile(menu),
					html = template({});
				this.$menu.html(html);
				this.$menu.on("click", function () {
					self.hideMenu();
				});
				this.$main.on("click", function () {
					self.hideMenu();
				});
			},

			/**
			 * Hide the menu
			 */
			hideMenu: function () {
				this.$menu.removeClass("menu-open");
				this.$shadowblock = this.$header.find("#shadow-block");
				this.$shadowblock.removeClass("menu-open");
			},

			/**
			 * Load the login form
			 */
			loadLogin: function () {
				this.loaded = false;
				this.$main
					.html(login)
					.find("input:first-of-type")
					.focus();
				this.loadHeader(false);
			},

			/**
			 * Get input from form element by name
			 */
			getValue: function (form, name) {
				return form.find("[name=\"" + name + "\"]").val();
			},

			/**
			 * Load the app
			 */
			loadApp: function () {
				if (!this.loaded) {
					this.loadHeader(true);
					this.loadMenu();
					this.loaded = true;
				}
			},

			/**
			 * Load projects
			 */
			loadProjects: function (data, controller) {
				var template = Handlebars.compile(projects),
					html = template({
						projects: data
					});
				this.$main.html(html);
				// Watch for build trigger
				this.$main.find(".project-run-build").click(function () {
					// Spin teh icon!
					$(this).find("i").addClass("fa-spin");
					var project = $(this).data("project");
					controller.runBuild(project);
				});
			},

			/**
			 * Update project status
			 */
			updateStatus: function (project, log, status) {
				var statusEl = this.$main.find("[data-status=\"" + project + "\"]"),
					timestampEl = this.$main.find("[data-timestamp=\"" + project + "\"]");
				switch (status) {
				case "pass":
					statusEl.html("<a href=\"#/logs/" + project + "/" + log + "\" title=\"Build Passing\"><i class=\"fa fa-circle green\"></i></a>");
					break;
				case "fail":
					statusEl.html("<a href=\"#/logs/" + project + "/" + log + "\" title=\"Build Failing\"><i class=\"fa fa-circle red\"></i></a>");
					break;
				case "processing":
					// Don't keep replacing, just check state
					if (!statusEl.find("i").hasClass("yellow")) {
						statusEl.html("<a href=\"#/logs/" + project + "/" + log + "\" title=\"Processing\"><i class=\"fa fa-refresh fa-circle yellow\"></i></a>");
						timestampEl.html(timestamp(log));
					}
					break;
				}
			},

			/**
			 * Update active log
			 */
			updateLog: function (log, content) {
				var el = this.$main.find("[data-log=\"" + log + "\"]");
				el.append(content);
				// Scroll!
				$("html, body").scrollTop($(document).height());
			},

			/**
			 * Load individual project (config)
			 */
			loadProject: function (data, controller) {
				var self = this,
					template = Handlebars.compile(project),
					html = template(data);
				this.$main.html(html);

				// Validate repo
				var validateRepo = function (str) {
					var name = str.split("/");
					// Check extension
					if (name[name.length - 1].indexOf(".git") !== -1) {
						return name[name.length - 1].replace(".git", "");
					}
					return false;
				};

				// On repo change, modify hook and dir/name
				this.$main.find("#project-repo").off().on("input", function () {
					var val = $(this).val(),
						deployUrl = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : ""),
						id = self.$main.find("#project-id"),
						hook = self.$main.find("#project-hook"),
						name = validateRepo(val);

					if (name) {
						id.text(name);
						hook.text(deployUrl + "/deploy/" + name);
					}
				});

				// Handle form submission
				$("#project-config").submit(function (e) {
					e.preventDefault();
					var data = $(this).serializeObject();

					if (data.hasOwnProperty("repo")) {
						// Validate repo before creating
						var name = validateRepo(data.repo);
						if (name) {
							data.name = name;
							controller.saveProject(data);
						} else {
							self.showError("Invalid project repository");
						}
					} else {
						// This is a modification, repo already valid
						controller.saveProject(data);
					}
				});

				// Handle delete request
				this.$main.find("#project-delete").click(function () {
					// Hide delete button
					$(this).hide();
					// Show confirm/cancel
					self.$main.find("#project-confirm-delete, #project-cancel-delete").show();
				});

				// Confirm and process delete
				this.$main.find("#project-confirm-delete").click(function () {
					controller.deleteProject(self.$main.find("input[name=\"id\"]").val());
				});

				// Cancel delete
				this.$main.find("#project-cancel-delete").click(function () {
					// Show delete button
					self.$main.find("#project-delete").show();
					// Hide confirm/cancel
					self.$main.find("#project-confirm-delete, #project-cancel-delete").hide();
				});
			},

			/**
			 * Load logs
			 */
			loadLogs: function (project, data) {
				var template = Handlebars.compile(logs),
					html = template({
						project: project,
						logs: data
					});
				this.$main.html(html);
			},

			/**
			 * Load log output
			 */
			loadLogOutput: function (project, log, timestamp, output) {
				var template = Handlebars.compile(logview),
					html = template({
						project: project,
						logid: log,
						timestamp: timestamp,
						file: output
					});
				this.$main.html(html);
			},

			/**
			 * Load tokens
			 */
			loadTokens: function (data, controller) {
				var self = this,
					template = Handlebars.compile(tokens),
					html = template({
						tokens: data
					});
				this.$main.html(html);
				// Bind new-token form
				this.$main.find("#add-token").submit(function (e) {
					e.preventDefault();
					controller.addToken($(this).serializeArray());
				});
				// Bind delete
				this.$main.find(".delete-token").click(function () {
					// Ensure at least one token is present
					if (self.$main.find(".token-list-item").length === 1) {
						self.showError("Must maintain at least one token");
					} else {
						controller.deleteToken($(this).data("token"));
					}
				});
			},

			/**
			 * Applies floating property to fixed header
			 */
			floatHeader: function () {

				var self = this;

				self.$window.scroll(function () {
					if ($(this).scrollTop() > 0) {
						self.$header.addClass("floating");
					} else {
						self.$header.removeClass("floating");
					}
				});
			},

			/**
			 * Opens and closes menu
			 */
			bindMenu: function () {
				var self = this;
				self.$header.off().on("click", ".menu-button", function () {
					self.$menu.toggleClass("menu-open");
					self.$shadowblock.toggleClass("menu-open");
				});
			},

			/**
			 * Shows notification pop-up
			 */
			showNotification: function (type, message) {
				var self = this;
				self.$notification.addClass(type).children("div").text(message);
				// Auto-close after timeout
				var closer = setTimeout(function () {
					self.$notification.removeClass(type);
				}, 3000);
				// Bind close button
				self.$notification.find("a").click(function () {
					self.$notification.removeClass(type);
					window.clearTimeout(closer);
				});
			},

			// Proxy for showNotifcation
			showError: function (message) {
				this.showNotification("error", message);
			},

			// Proxy for showNotification
			showSuccess: function (message) {
				this.showNotification("success", message);
			}
		};

		Handlebars.registerHelper("compare", function (lvalue, rvalue, options) {

			if (arguments.length < 3) {
				throw new Error("Handlerbars Helper compare needs 2 parameters");
			}

			var operator = options.hash.operator || "==";

			var operators = {
				"===": function (l, r) {
					return l === r;
				},
				"!==": function (l, r) {
					return l !== r;
				},
				"<": function (l, r) {
					return l < r;
				},
				">": function (l, r) {
					return l > r;
				},
				"<=": function (l, r) {
					return l <= r;
				},
				">=": function (l, r) {
					return l >= r;
				},
				"typeof": function (l, r) {
					return typeof l === r;
				}
			};

			if (!operators[operator]) {
				throw new Error("Handlerbars Helper compare does not know the operator " + operator);
			}

			var result = operators[operator](lvalue, rvalue);

			if (result) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}

		});

		Handlebars.registerHelper("key_value", function (obj, options) {
			var buffer = "",
				key;

			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					buffer += options.fn({
						key: key,
						value: obj[key]
					});
				}
			}

			return buffer;
		});

		$.fn.serializeObject = function () {
			"use strict";

			var result = {};
			var extend = function (i, element) {
				var node = result[element.name];

				if ("undefined" !== typeof node && node !== null) {
					if ($.isArray(node)) {
						node.push(element.value);
					} else {
						result[element.name] = [node, element.value];
					}
				} else {
					result[element.name] = element.value;
				}
			};

			$.each(this.serializeArray(), extend);
			return result;
		};

		return dom;

	});
