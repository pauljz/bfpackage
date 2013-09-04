var path = require('path'),
	wrench = require('wrench'),
	fs = require('fs'),
	spawn = require('child_process').spawn,
	common = require('./common');

/**
 * Revert a file from the package cache
 */
module.exports = function(pkg, repo, target, done) {
	var bfpackage = common.packages();

	var trailingSlash = new RegExp(path.sep+'$');
	if (!target.match(trailingSlash)) {
		target += path.sep;
	}
	target += pkg;

	if (!repo.match(/:\/\//)) {
		console.log("before", repo);
		repo = common.remote().replace('{{repo}}', repo);
		console.log("after", repo);
	}

	console.log("Running", 'bower', 'install', pkg+'='+repo, '--save');

	var bower = spawn('bower', ['install', pkg+'='+repo, '--save'], { stdio: 'inherit' });
	bower.on('close', function() {
		bfpackage[pkg] = {
			target: target,
			source: repo
		};
		common.writePackages(bfpackage);
		common.copyOne(pkg);
		done();
	});
};