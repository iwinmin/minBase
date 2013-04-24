/*!
 * minBase - Client Main Interface v@VERSION
 * Copyright(c) 2013 WinMin
 * MIT Licensed
 */

(function(win, con){
	var undef;
	var exist = win.hasOwnProperty('minBase');
	var origin = win.minBase;

	// Instance Cache List
	var instances = [];
	// Middleware Plugin List
	var plugins = {};

	/**
	 * Base Interface Constructor
	 * @param {Object} config instance config object
	 */
	function Interface(config){
		this.config = config;
	}
	Interface.prototype = {
		version: '@VERSION',

		use: function(process){

		},

		set_session: function(session_id){

		},

		bind: function(uri, param, callback, count){

		},

		unbind: function(uri, callback){

		},

		send: function(uri, message){

		},
		/**
		 * free up instance
		 * @return {None}
		 */
		free: function(){
			// remove the instance from instances cache
			for (var i=0; i<instances.length; i++){
				if (instances[i] === this){
					instances.splice(i,1);
					break;
				}
			}
			// instance free process
		}
	};


	/**
	 * Manager Object
	 * The Exported Interface
	 */
	var manager = {
		/**
		 * create an minBase instance with config
		 * @param  {Object} config init config param object
		 * @return {Object}        new minBase instance
		 */
		create: function(config){
			var base = new Interface(config);
			instances.push(base);
			return base;
		},
		/**
		 * free up all instance connection
		 * @return {None}
		 */
		free: function(){
			while (instances.length){
				try {
					instances.pop().free();
				}catch(e){
					log_error('free instances error:'+e);
				}
			}
		},
		/**
		 * install Middleware plugin by name
		 * @param  {String}   name   plugin name
		 * @param  {Function} plugin plugin callback function
		 * @return {Function}        last plugin callback function
		 */
		install: function(name, plugin){
			if (!plugin){ return false; }
			var last = plugins[name];
			plugins[name] = plugin;
			return last;
		},
		/**
		 * get the Middleware plugin by name
		 * @param  {String}   name plugin name
		 * @return {Function}      plugin callback function or false
		 */
		plugin: function(name){
			if (plugins[name]){
				return plugins[name];
			}else {
				return false;
			}
		},
		/**
		 * relinquish the global namespace midBase
		 * @return {Object} this manager object
		 */
		noConflict: function(){
			if (exist){
				win.minBase = origin;
			}else {
				delete win.minBase;
			}
			return this;
		}
	};

	/**
	 * Console Log Warning Message
	 * @param  {String} msg message string
	 * @return {None}
	 */
	function log_warn(msg){
		// IFDEF DEBUG
		if (con){
			if (con.warn){
				con.warn('minBase - ' + msg);
			}else if (con.log){
				con.log('[WARNING] minBase - ' + msg);
			}
		}
		// ENDIF
	}
	/**
	 * Console Log Error Message
	 * @param  {String} msg message string
	 * @return {None}
	 */
	function log_error(msg){
		// IFDEF DEBUG
		if (con){
			if (con.error){
				con.error('minBase - ' + msg);
			}else if (con.log){
				con.log('[ERROR] minBase - ' + msg);
			}
		}
		// ENDIF
	}

	// export Manager Object to global
	win.minBase = manager;
})(this, console);