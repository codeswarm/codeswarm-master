var fs = require("fs"),
    fse = require("fs-extra"),
    async = require("async"),
    express = require("express"),
    app = express(),
    builds = express(),
    spawn = require("child_process").spawn,
    git = require("gift"),
    config = require("./config.json"),
    build_path = __dirname + "/builds/",
    log_path = __dirname + "/logs/";

/**
 * Deploy listener
 */

app.get("/:key/:project", function(req, res) {
    
    // Ensure the project has been config'd
    if (!config.hasOwnProperty(req.params.project)) {
        // Nope, send an error
        res.send("Failed to deploy. Missing or incorrect configuration.");
    } else if (config[req.params.project].key !== req.params.key) {
        // Incorrect build key
        res.send("Failed to deploy. Incorrect or missing build key.");
    } else {
        
        // Set build
        var build = config[req.params.project],
            step;
        
        build.log = log_path + build.dir + "/" + new Date().getTime()+".log";
        
        res.send("Deploying. Logfile: " + build.log.replace(__dirname, ""));
        
        async.series({
            // Create log file
            log: function (callback) {
                fse.createFile(build.log, callback);
            },
            cleanup: function (callback) {
                log(build, "Cleanup");
                fse.remove(build_path+build.dir, callback);
            },
            clone: function (callback) {
                log(build, "[PASS]", false);
                log(build, "Cloning Repo");
                git.clone(build.repo, build_path+build.dir, callback);
            },
            config: function (callback) {
                log(build, "[PASS]", false);
                log(build, "Getting Config");
                fs.readFile(build_path+build.dir+"/.vouch.json", function (err, config) {
                    build.config = JSON.parse(config);
                    callback(err);
                });
            },
            run: function (callback) {

                log(build, "[PASS]", false);
                // Ensure run commands available
                if (build.config.hasOwnProperty("run")) {
                    
                    async.eachSeries(build.config.run, function(i, callback) {
                        
                        log(build, "Running " + i);
                        
                        var args = i.split(" "),
                            command = args[0],
                            proc,
                            output = [];

                        args.shift();
                    
                        // Spawn command and push output to array
                        if (args.length) {
                            proc = spawn(command, [args], { cwd: build_path+build.dir });
                        } else {
                            proc = spawn(command, [], { cwd: build_path+build.dir });
                        }
                        
                        // Record standard output
                        proc.stdout.on("data", function (data) {
                            output.push(data);
                        });
                        
                        // Record error output
                        proc.stderr.on("data", function (data) {
                            output.push(data);
                        });
                            
                        // Check status on close
                        proc.on("close", function (code, signal) {
                            if (code===0) {
                                // Success
                                log(build, Buffer.concat(output).toString());
                                log(build, "[PASS]", false);
                                callback(null);
                            } else {
                                // Failure
                                callback(Buffer.concat(output).toString());
                            }
                        });
                    }, function (err) {
                        callback(err);
                    });
                    
                } else {
                    callback(null);
                }
            }
        }, function (err, result) {
            if (err) {
                log(build, "[FAIL] \n" + err, false);
            } else {
                log(build, "BUILD COMPLETE");
            }
        });
    }

});

// Log build data
var log = function (build, data, br) {
    br = (br === undefined) ? "\n" : " ";
    fs.appendFileSync(build.log, br + data);
    console.log(data);
};


app.listen(1337);
console.log("Serving app over 1337");

/**
 * Static server
 */
 
// Setup basic authentication
var basicAuth = express.basicAuth,
    auth = function(req, res, next) {
        if (config.hasOwnProperty(req.params.project)) {
            var auth = config[req.params.project].auth;
            if (auth) {
                basicAuth(function(user, pass, callback) {
                    // Check credentials
                    callback(null, user === auth.user && pass === auth.pass);
                })(req, res, next);
            } else {
                // No authentication
                return true;
            }
        }
    };
    
console.log(auth);

 
builds.get("/:project", auth, function (req, res) {
    if(!config.hasOwnProperty(req.params.project)) {
        res.send("Missing configuration");
    } else {
        // Get .vouch.json from build
        fs.readFile(build_path + config[req.params.project].dir + "/.vouch.json", function (err, data) {
            if (err) {
                // Problem reading deploy config
                res.send(err);
            } else {
                var deploy = JSON.parse(data),
                    dir = build_path + config[req.params.project].dir + "/" + deploy.dir;
                // Send default file by... well, default.
                res.sendfile("/" + deploy.default, { root: dir } );
            }    
        });
    }
});

builds.listen(8080);
console.log("Serving builds over 8080");