var path = require('path'),
	mkdirp = require('mkdirp'),
	wrench = require('wrench'),
	spawn = require('child_process').spawn,
	common = require('./common');

/**
 * Fetch the latest version of the module,
 * and merge changes back into it.
 */
module.exports = function(pkg) {
	var bfpackage = common.packages();

	if (!bfpackage.hasOwnProperty(pkg)) {
		console.log("Could not find package " + pkg);
		return;
	}

	// Git checkout into contrib directory
	var homedir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
	var dst = homedir +  path.sep + '.bfpackage' + path.sep + 'contrib' + new Date().getTime();
	spawn('git', ['clone', bfpackage[pkg].source, dst], { stdio: 'inherit' }).on('close', function() {
		var src = bfpackage[pkg].target;

		var dst2 = dst+'local';
		mkdirp(dst2);

		wrench.copyDirSyncRecursive(src, dst2, { forceDelete: true });
		wrench.copyDirSyncRecursive(dst+path.sep+'.git',  dst2+path.sep+'.git', { forceDelete: true });
		wrench.rmdirSyncRecursive(dst);

		console.log("Run the following to continue:");
		console.log();
		console.log('cd ' + dst2 + ' && git config core.filemode false && git status' );
		console.log();
	});

};