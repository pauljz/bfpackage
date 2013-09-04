var path = require('path'),
	wrench = require('wrench'),
	common = require('./common');

/**
 * Revert a file from the package cache
 */
module.exports = function(pkg) {
	var bfpackage = common.packages();

	if (!bfpackage.hasOwnProperty(pkg)) {
		console.log("Could not find package " + pkg);
		return;
	}

	var dst = bfpackage[pkg].target;
	var cache = '.bfpackage.cache'+path.sep+dst;

	wrench.copyDirSyncRecursive(cache, dst, { forceDelete: true });
};
