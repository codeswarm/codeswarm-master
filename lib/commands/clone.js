module.exports = checkout;

function checkout(build, worker) {
  worker.command('git', ['clone', build.repo, '.']);
}