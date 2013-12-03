var configuration = require("./lib/configuration.js"),
	fs = require("fs"),
	express = require("express"),
	app = express(),
	expressAuth = require("./lib/express-auth.js"),
	builder = require("./lib/builder.js"),
	api = require("./lib/api.js"),
	slashes = require("connect-slashes");

// Set global config
config = configuration.get();

/**
 * Watch config for changes ##########################################
 */

fs.watchFile("./config.json", {
	persistent: true,
	interval: 500
}, function (curr, prev) {
	if (curr.mtime !== prev.mtime) {
		config = configuration.get();
	}
});

/**
 * Build/Deploy Listener #############################################
 */

app.post("/deploy/:project", function (req, res) {
	// Get project
	var project = req.params.project;
	// Ensure the project has been config'd
	if (!config.builds.hasOwnProperty(project)) {
		// Nope, send an error
		res.send("ERROR: Configuration.");
	} else {
		// Set build
		var build = config.builds[project],
			stamp = new Date().getTime();
		// Set state object
		build.state = {};
		// Set ID
		build.state.id = stamp;
		// Set name
		build.state.name = project + ", Build " + stamp;
		// Set log
		build.state.log = config.app.logs + build.dir + "/" + stamp + ".log";
		// Set status
		build.state.status = "processing";
		// Send deploy response
		res.send("DEPLOYING: Logfile: " + build.state.log.replace(__dirname, ""));
		// Run build
		builder(build);
	}

});

/**
 * Static Server #####################################################
 */

// Fix trailing slashes (or lack there of)  
app.use(slashes());

// Get by project route 
app.get("/:project/*", expressAuth, function (req, res) {
	var project = req.params.project;
	if (!config.builds.hasOwnProperty(project) || project === "dashboard") {
		res.sendfile("index.html", {
			root: "./ui/src"
		});
	} else {
		// Check if build is running
		if (config.builds[project].hasOwnProperty("state") && config.builds[project].state.status === "processing") {
			// Build is processing
			res.send("<html><head><meta http-equiv=\"refresh\" content=\"5\"></head><body>Build processing, please wait...</body></html>");
		} else {
			// Get .vouch.json from build
			fs.readFile(config.app.builds + config.builds[project].dir + "/.vouch.json", function (err, data) {
				if (err) {
					// Problem reading deploy config
					res.send("Missing deploy script.");
				} else {
					// Check that build status is passing
					if (config.builds[project].hasOwnProperty("state") && config.builds[project].state.status === "pass") {
						var deploy = JSON.parse(data),
							dir = config.app.builds + config.builds[project].dir + "/" + deploy.dir,
							path = req.params[0] ? req.params[0] : deploy.
						default;
						// Send default file by... well, default.
						res.sendfile(path, {
							root: dir
						});
					} else {
						res.send("Build failed.");
					}
				}
			});
		}
	}
});

// Admin UI
app.get("/dashboard/*", function (req, res) {
	var path = req.params[0] ? req.params[0] : "index.html";
	res.sendfile(path, {
		root: "./ui/src/"
	});
});

// API
app.get("/api/:type/*", function (req, res) {
	api.get(req, res);
});

app.post("/api/:type/*", function (req, res) {
	api.post(req, res);
});

app.put("/api/:type", function (req, res) {
	api.put(req, res);
});

app.del("/api/:type/*", function (req, res) {
	api.del(req, res);
});

/**
 * Start App #########################################################
 */

app.listen(config.app.port);
console.log("Service running over " + config.app.port);
