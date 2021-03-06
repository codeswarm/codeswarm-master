var extend   = require('util')._extend;
var EE2      = require('eventemitter2').EventEmitter2;

var hub = exports = module.exports = new EE2();

var PUSH_INTERVAL_MS = 2000;

/// addWorker

hub.addWorker = addWorker;

function addWorker(build, worker) {

  build.started_at = Date.now();
  build.ended = false;
  build.success = true;

  worker.on('error', onError);
  worker.on('stage.begin', onStageBegin);
  worker.on('stage.end', onStageEnd);
  worker.on('command', onWorkerCommand);
  worker.on('stdout', onWorkerStdout);
  worker.on('stderr', onWorkerStderr);
  worker.on('close', onWorkerClose);
  worker.on('data', onWorkerData);
  worker.on('build.end', onBuildEnd);

  pushBuild();
  var interval = setInterval(pushBuild, PUSH_INTERVAL_MS);

  Project.merge(build.project, {
    state: 'running',
    started_at: Date.now(),
    ended_at: '',
    last_build: build.id
  }, updatedProject);

  function onError(err) {
    var lastCommand = build.lastCommand;
    build.success = false;

    if (! lastCommand) {
      // no command was run, something is seriously wrong
      console.error('no command was run, and we got an error, something is seriously wrong: %s', err.stack);
      throw err;
    } else {
      lastCommand.out += '\n' + err.stack;
      lastCommand.stderr += '\n' + err.stack;
      lastCommand.exitCode = 1;
      lastCommand.finished_at = Date.now();
    }
  }

  function onStageBegin(stage) {
    build.stage = stage;
    if (! build.stages) build.stages = {};
    if (! build.stages[stage]) build.stages[stage] = {
      ended: false,
      ended_at: undefined,
      commands: []
    };
  }

  function updatedProject(err) {
    if (err) throw err;
  }

  function onStageEnd(stage) {
    if (build.ended) return;
    build.stages[stage].ended = true;
    build.stages[stage].ended_at = Date.now();
  }

  function onWorkerCommand(cmd, args, options) {
    if (build.ended) return;
    var command = {
      command: cmd,
      args: args,
      options: options,
      out: '',
      stdout: '',
      stderr: '',
      exitCode: undefined
    };
    build.lastCommand = command;
    build.stages[build.stage].commands.push(command);
  }

  function onWorkerStdout(buf) {
    if (build && build.lastCommand) {
      build.lastCommand.out += buf;
      build.lastCommand.stdout += buf;
    }
  }

  function onWorkerStderr(buf) {
    if (build && build.lastCommand) {
      build.lastCommand.out += buf;
      build.lastCommand.stderr += buf;
    }
  }

  function onWorkerClose(code) {
    if (build && build.lastCommand) {
      build.lastCommand.exitCode = code;
      if (code != 0) {
        build.success = false;
      }
      build.lastCommand.finished_at = Date.now();
    }
  }

  function onWorkerData(data) {
    var projectData = {
      data: data
    };
    ProjectData.merge(build.project, projectData, savedProjectData);

    var buildData = {
      id: build.id,
      project: build.project,
      commit: build.commit,
      tags: build.tags,
      data: data
    };
    BuildData.create(buildData, savedBuildData);
  }

  function onBuildEnd() {
    if (! build.ended) {
      build.ended = true;

      clearInterval(interval);
      interval = undefined;

      build.ended_at = Date.now();
      build.state = build.success ? 'passed' : 'failed';
      build.save(updatedBuild);

      var projectProps = {
        state: build.success ? 'passed' : 'failed',
        ended_at: Date.now()
      };
      if (build.success) projectProps.last_successful_build = build.id;

      Project.merge(build.project, projectProps, updatedProject);
    }
  }

  function updatedBuild(err, _build) {
    if (err) throw err;
    build = _build
    pushBuild();
  }

  function pushBuild() {

    if (build) {
      sails.io.sockets.in(build.project + ' builds').
        emit('build', build);

      sails.io.sockets.in('build ' + build.id).
        emit('build detail', build.project, Build.forShow(build));

    }
  }

}

function savedProjectData(err) {
  if (err) {
    console.error('Error saving project data: %s', err.message);
    throw err;
  }
}

function savedBuildData(err) {
  if (err) {
    console.error('Error saving build data: %s', err.message);
    throw err;
  }
}