define([
	'utils/dom',
	'utils/requests',
	'utils/timestamp',
	'utils/socket',
	'utils/build'
], function (dom, requests, timestamp, socket, Build) {
	var builds;

	builds = {

		list: function (project) {
			var req = requests.get('/projects/' + project + '/builds');

			req.done(function (builds) {
				builds.sort(sortByDesc('created_at'));

				builds.forEach(function (build) {
					if (build.started_at) {
                        build.started_at = timestamp(build.started_at);
                    }

					if (build.ended_at) {
                        build.ended_at = timestamp(build.ended_at);
                    }
				});

				socket.addBuilds(project, builds);

				dom.loadBuilds(project, builds);
			});

			req.fail(function () {
				dom.showError('Could not load builds');
			});
		},

		show: function (project, build) {
			var req = requests.get('/projects/' + project + '/builds/' + build);

			socket.watchBuild(build);

			req.done(function (build) {
				console.log('BUILD:', build);
				build = Build.forShow(build);
				dom.loadLogOutput(project, build);
			});

			req.fail(function () {
				dom.showError('Could not load log file');
			});
		}

	};

	return builds;
});

function decorateLine(line) {
	return '<p>' + line + '</p>';
}

function sortByDesc(prop) {
	return function(a, b) {
		return b[prop] - a[prop];
	};
}
