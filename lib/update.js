var async = require('async'),
	spawn = require('child_process').spawn,
	path = require('path'),
	common = require('./common');

var update = module.exports;

/**
 * Copy bower components into place.
 */
module.exports.update = function(done) {
	var bfpackage = common.packages();
	async.eachSeries(Object.keys(bfpackage), update.updateOne, function() {
		done();
	})
};

module.exports.updateOne = function(pkg, done) {
	var bower = spawn('bower', ['update', pkg], { stdio: 'inherit' });
	bower.on('close', done);
};