"use strict";

module.exports = function(grunt) {

	var GCC_OPTIONS = {
		compilation_level: "SIMPLE_OPTIMIZATIONS",
		externs: "tools/extern.js",

		warning_level: "VERBOSE",
		jscomp_off: "checkTypes",
		jscomp_error: "checkDebuggerStatement"
	};

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		jshint: {
			config: {
				files: {
					src: ['Gruntfile.js']
				},
				options: {
					node: true,
					es5: true
				}
			},
			client: [
				'client/**/*.js'
			],
			server: {
				files: {
					src: ['server/**/*.js']
				},
				options: {
					node: true,
					es5: true
				}
			},
			examples: [
				'examples/**/*.js'
			],
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				undef: true,
				unused: 'vars',
				boss: true,
				eqnull: true,
				predef: ['window','console'],
				globals: {}
			}
		},
		concat: {
			client: {
				src: [
					"client/src/main.js",
					"client/src/config.js",

					"client/src/transport-websocket.js",
					"client/src/transport-ajax.js",
					"client/src/transport-iframe.js"
				],
				dest: "dist/mb-client-debug.js"
			},
			server_nodejs: {
				src: [
					"server/nodejs/src/main.js",
					"server/nodejs/src/config.js",

					"server/nodejs/src/transport-websocket.js",
					"server/nodejs/src/transport-ajax.js",
					"server/nodejs/src/transport-iframe.js"
				],
				dest: "dist/mb-server-nodejs-debug.js"
			}
		},
		watch: {
			config: {
				files: 'Gruntfile.js',
				tasks: ['jshint:config']
			},
			client: {
				files: 'client/**/*.js',
				tasks: ['jshint:client']
			},
			server: {
				files: 'server/**/*.js',
				tasks: ['jshint:server']
			},
			examples: {
				files: 'examples/**/*.js',
				tasks: ['jshint:examples']
			}
		},
		gcc: {
			client: {
				src: "dist/mb-client-debug.js",
				dest: "dist/mb-client.js",
				options: grunt.util._.merge({
					banner: "/*! minBase Client <%= pkg.version %> | mb.win-ing.cn/LICENSE.md */",
					source_map_format: "V3",
					create_source_map: "dist/mb-client.js.map"
				}, GCC_OPTIONS)
			},
			server_nodejs: {
				src: "dist/mb-server-nodejs-debug.js",
				dest: "dist/mb-server-nodejs.js",
				options: grunt.util._.merge({
					banner: "/*! minBase NodeJS Server <%= pkg.version %> | mb.win-ing.cn/LICENSE.md */",
					source_map_format: "V3",
					create_source_map: "dist/mb-server-nodejs.js.map"
				}, GCC_OPTIONS)
			}
		}
	});

	grunt.registerTask("embed", "Embed version etc.", function() {
		var configs = grunt.config("concat");
		var version = grunt.config("pkg.version");
		var code, name;

		for (name in configs){
			name = configs[name].dest;
			code = grunt.file.read(name);
			code = code.replace(/@VERSION/g, version);
			grunt.file.write(name, code);
		}

		grunt.log.writeln("@VERSION is replaced to \"" + version + "\".");
	});

	grunt.registerTask("fix", "Fix sourceMap etc.", function() {
		var configs = grunt.config('gcc');
		var code, name, mapfile, minfile, srcfile;
		var mapname, minname, srcname;

		for (name in configs){
			mapfile = configs[name].options.create_source_map;
			minfile = configs[name].dest;
			srcfile = configs[name].src;

			mapname = mapfile.split("/").pop();
			minname = minfile.split("/").pop();
			srcname = srcfile.split("/").pop();

			code = grunt.file.read(mapfile);
			code = code.replace('"file":""', '"file":"' + minname + '"');
			code = code.replace(srcfile, srcname);
			code = code.replace(srcfile.replace(/[\/]+/g, '\\\\'), srcname);
			grunt.file.write(mapfile, code);
			grunt.log.writeln('"' + mapfile + '" is fixed.');

			code = grunt.file.read(minfile);
			code += "//@ sourceMappingURL=" + mapname + "\n";
			grunt.file.write(minfile, code);
			grunt.log.writeln('"' + minfile + '" is fixed.');
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadTasks("tools/grunt-tasks");
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// "npm test" runs these tasks
	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('test-client', ['jshint:client']);
	grunt.registerTask('test-server', ['jshint:server']);
	grunt.registerTask('test-examples', ['jshint:examples']);

	// Watch tasks
	grunt.registerTask('watch-all', ['jshint','watch']);
	grunt.registerTask('watch-client', ['jshint:client','watch:client']);
	grunt.registerTask('watch-server', ['jshint:server','watch:server']);
	grunt.registerTask('watch-examples', ['jshint:examples','watch:examples']);

	// Build task
	grunt.registerTask('build', ['concat','embed','gcc','fix']);

	// Default task.
	grunt.registerTask('default', ['build']);

	// default force mode
	grunt.option('force', true);
};