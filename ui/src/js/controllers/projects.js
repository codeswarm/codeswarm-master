define([
	"controllers/dom",
	"controllers/requests",
	"controllers/router"
], function (dom, requests, Router) {

	var router = new Router();

	var projects = {

		showList: function () {

			var self = this,
				req = requests.get("/api/projects");

			req.done(function (data) {
				dom.loadProjects(data, self);
			});

			req.fail(function () {
				dom.showError("Could not load projects");
			});
		},

		runBuild: function (project) {
			var req = requests.post("/deploy/" + project);

			req.done(function (data) {
				console.log(data);
				dom.showSuccess("Starting build...");
				// Pause to allow build to start, then redirect
				setTimeout(function () {
					router.go("/logs/" + project + "/" + data.build);
				}, 2000);
			});

			req.fail(function () {
				dom.showError("Could not start build");
			});

		},

		showProject: function (project) {

			var self = this,
				data,
				reqKey = requests.get("/api/deploykey"),
				hook = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");

			var loadProject = function (hook, key) {
				if (project !== "new") {

					var req = requests.get("/api/project/" + project);

					req.done(function (data) {
						data.hook = hook + "/deploy/" + data.dir;
						// Add key to data
						data.key = key;
						// Load project
						dom.loadProject(data, self);
					});

					req.fail(function () {
						dom.showError("Could not load project");
					});

				} else {
					data = {
						dir: "new-project",
						repo: "",
						auth: false,
						state: false,
						hook: hook + "/deploy/new-project",
						key: key
					};
					dom.loadProject(data, self);
				}
			};

			reqKey.done(function (key) {
				loadProject(hook, key);
			});

			reqKey.fail(function () {
				loadProject(hook, false);
			});

		},

		saveProject: function (data) {
			var req;
			// Set auth object
			if (data.user.length > 0 || data.pass.length > 0) {
				data.auth = {
					user: data.user,
					pass: data.pass
				};
			} else {
				data.auth = false;
			}
			// Send to API
			if (data.id === "new-project") {
				// Create new (PUT)
				req = requests.put("/api/project", {
					dir: data.name,
					repo: data.repo,
					auth: data.auth
				});

				req.done(function () {
					dom.showSuccess("Project successfully created");
					// Update ID field
					dom.$main.find("input[name=\"id\"]").val(data.name);
				});

				req.fail(function () {
					dom.showError("Project could not be created");
				});
			} else {
				// Modify object
				req = requests.post("/api/project/" + data.id, data.auth);

				req.done(function () {
					dom.showSuccess("Project successfully saved");
				});

				req.fail(function () {
					dom.showError("Project could not be saved");
				});
			}
		},

		deleteProject: function (name) {
			var req = requests.delete("/api/project/" + name);

			req.done(function () {
				router.go("/projects");
				dom.showSuccess("Project successfully deleted");
			});

			req.fail(function () {
				dom.showError("Could not delete project");
			});
		}

	};

	return projects;

});
