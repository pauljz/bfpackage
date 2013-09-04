#! /usr/bin/env node

var common = require('./common');

var argv = require('optimist').argv;
var command = argv._[0];

switch(command) {
	case 'list':
		common.jumbotron("Installed Packages");
		var bfpackage = common.packages();
		if (!Object.keys(bfpackage).length) {
			console.log("There are no installed packages.");
			console.log();
			process.exit();
		}
		var maxlength = 0;
		Object.keys(bfpackage).forEach(function(k) {
			maxlength = Math.max(k.length, maxlength);;
		});
		maxlength++;
		var padding = Array(maxlength).join(" ")
		Object.keys(bfpackage).forEach(function(k) {
			console.log( String(k + ' ' + padding).slice(0, maxlength) + " " + bfpackage[k].target);
			console.log( padding + '  (' + bfpackage[k].source + ')');
			console.log(" ");
		});

		console.log("(You also could've just looked at the bfpackage.json file)");
		console.log();
		break;

	case 'install':
		if (argv._.length !== 4) {
			console.log();
			console.log("Usage: bfpackage install <name> <repo> <destination>");
			console.log();
			process.exit();
		}
		common.jumbotron("Installing " + argv._[1]);
		console.log("      into ... " + argv._[2]);
		console.log();
		common.restore();
		(require('./install'))(argv._[1], argv._[2], argv._[3], function() {
			console.log();
			common.cleanup();
			process.exit();
		});
		break;

	case 'revert':
		common.jumbotron("Reverting " + argv._[1]);
		(require('./revert'))(argv._[1]);
		break;

	case 'contrib':
		common.jumbotron("Contributing " + argv._[1]);
		(require('./contrib'))(argv._[1]);
		break;

	case 'update':
		if (common.check().length) {
			process.exit();
		}
		if (argv._[1]) {
			common.jumbotron("Updating " + argv._[1]);
			common.restore();
			(require('./update')).updateOne(argv._[1], function() {
				console.log();
				common.cleanup();
				process.exit();
			});
		} else {
			common.jumbotron("Updating All Packages");
			(require('./update')).update(function() {
				console.log();
				common.cleanup();
				process.exit();
			});
		}
		break;

	case 'check':
		var checks = common.check();
		if (!checks.length) {
			console.log("All clear.");
		}
		break;

	case 'help':
	default:
		common.jumbotron('bfpackage');
		console.log("Commands:")
		console.log();
		console.log(" - list");
		console.log("       lists all installed packages");
		console.log();
		console.log(" - install <name> <repo> <dest>");
		console.log("       installs a package into the target directory");
		console.log("           <name> - usually the name of the git repo itself");
		console.log("           <repo> - A full or partial path to the repo (a partial path will use bfpackage.json's remote option)");
		console.log("           <dest> - Destination directory that the package will be installed into. Name is appended automatically.");
		console.log();
		console.log(" - revert <name>");
		console.log("       Reverts any local changes made to an installed package.");
		console.log();
		console.log(" - contrib <name>");
		console.log("       Starts the process of merging your local changes back to the origin repo.");
		console.log();
		console.log(" - update (<name>)");
		console.log("       Updates packages to the latest version from their remote repos.");
		console.log();
		console.log(" - check");
		console.log("       Checks to see if any changes have been made locally to installed packages.");
		console.log();
		break;
}