var wrench = require('wrench'),
	path = require('path'),
	fs = require('fs'),
	buffertools = require('buffertools'),
	mkdirp = require('mkdirp');

var common = module.exports;

var unique = function(arr) {
	var u = {}, a = [];
	for(var i = 0, l = arr.length; i < l; ++i){
		if(u.hasOwnProperty(arr[i])) {
			continue;
		}
		a.push(arr[i]);
		u[arr[i]] = 1;
	}
	return a;
}

module.exports.restore = function() {
	var bfpackage = common.packages();

	mkdirp.sync('bower_components');

	Object.keys(bfpackage).forEach(function(pkg) {
		var cache = '.bfpackage.cache'+path.sep+bfpackage[pkg].target;
		wrench.copyDirSyncRecursive(cache, 'bower_components'+path.sep+pkg, { forceDelete: true });
	});
}

module.exports.jumbotron = function(text) {
	var border = "#";
	var padding = 5;
	var wrap = Array(text.length + padding*2 + 3).join(border);
	var paddingText = Array(padding).join(' ');
	console.log("");
	console.log(wrap);
	console.log(border + border + paddingText + text + paddingText + border + border);
	console.log(wrap);
	console.log("");
}

module.exports.getbfpackage = function() {
	var cwd = process.cwd();
	var bfpackagePath = cwd + path.sep + 'bfpackage.json';
	if (fs.existsSync(bfpackagePath)) {
		return require(bfpackagePath);
	} else {
		return {
			remote: 'https://github.com/{{repo}}.git',
			packages: []
		};
	}
};

module.exports.remote = function() {
	var bfpackage = common.getbfpackage();
	return bfpackage.remote || 'https://github.com/{{repo}}.git';
};

module.exports.writePackages = function(newPackages) {
	var cwd = process.cwd();
	var bfpackage = common.getbfpackage();
	bfpackage.packages = newPackages;
	fs.writeFileSync('bfpackage.json', JSON.stringify(bfpackage, null, 2));
};

module.exports.packages = function() {
	var cwd = process.cwd();
	var bfpackage = common.getbfpackage();
	return bfpackage.packages;
};

/**
 * See if changes have been made to a destination version of a component.
 */
module.exports.check = function() {
	var bfpackage = common.packages();

	var failures = [];

	Object.keys(bfpackage).forEach(function(k) {
		var src = bfpackage[k].target;
		var dst = '.bfpackage.cache'+path.sep+src;

		var srcFiles = require('findit').sync(src);
		var dstFiles = require('findit').sync(dst).map(function(file) {
			return file.replace(/^\.bfpackage\.cache\//, '');
		})

		if (srcFiles.length != dstFiles.length) {
			// console.log('files missing or created');
			failures.push(k);
			return;
		}

		var files = unique(srcFiles.concat(dstFiles));

		for (var i=0, l=files.length; i<l; i++) {
			var file = files[i];
			var srcFile = file;
			var dstFile = '.bfpackage.cache'+path.sep+file;

			// Compare existence
			if (!fs.existsSync(srcFile) || !fs.existsSync(dstFile)) {
				// console.log(srcFile, dstFile);
				// console.log('file is missing or created', srcFile);
				failures.push(k);
				return;
			}

			// Compare stats
			var srcStat = fs.lstatSync(srcFile);
			var dstStat = fs.lstatSync(dstFile);
			if (srcStat.isDirectory() !== dstStat.isDirectory() ||
				srcStat.size !== dstStat.size ||
				srcStat.isFile() !== dstStat.isFile() ||
				srcStat.isSymbolicLink() !== dstStat.isSymbolicLink()
			) {
				// console.log('stats not equal', srcFile);
				failures.push(k);
				return;
			}

			// Compare files
			if (srcStat.isFile() && dstStat.isFile()) {
				var srcContents = fs.readFileSync(srcFile);
				var dstContents = fs.readFileSync(dstFile);

				// Buffer.compare comes from buffertools
				if (srcContents.compare(dstContents) !== 0) {
					// console.log('contents not equal', srcFile);
					failures.push(k);
					return;
				}
			}
		}

	});

	if (failures.length) {
		common.jumbotron("I'm sorry Dave, I'm afraid I can't do that.");
		console.log("Changes exist in the following packages:");
		console.log("");
		failures.forEach(function(dir) {
			console.log("    > " + dir);
		});
		console.log();
		console.log("To begin the process of contributing your changes back, use:");
		console.log("    bfpackage contrib <packagename>");
		console.log();
		console.log("Or discard your changes with:");
		console.log("    bfpackage revert <packagename>");
		console.log();
	}

	return failures;
};

/**
 * Copy bower components into place.
 */
module.exports.copy = function() {
	var bfpackage = common.packages();
	Object.keys(bfpackage).forEach(common.copyOne);
};

module.exports.copyOne = function(pkg) {
	var bfpackage = common.packages();
	var dst = bfpackage[pkg].target
	var src = 'bower_components'+path.sep+pkg;
	var cache = '.bfpackage.cache'+path.sep+dst;

	mkdirp.sync(dst);
	mkdirp.sync(cache);

	wrench.copyDirSyncRecursive(src, dst, { forceDelete: true });
	wrench.copyDirSyncRecursive(src, cache, { forceDelete: true });
};

/**
 * Remove bower components that have been copied over.
 */
module.exports.cleanup = function() {
	var bfpackage = common.packages();

	Object.keys(bfpackage).forEach(function(k) {
		wrench.rmdirSyncRecursive('bower_components'+path.sep+k);
	});

	fs.rmdirSync('bower_components'); // This will only succeed if the directory is empty.
};