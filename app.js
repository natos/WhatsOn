
/**
 * module dependencies.
 */
var fs = require('fs'),
	util   = require('util'),
	express = require('express'),
	port = process.argv[2] || 8080;

var meta = {
	title: 'Whats on'
}

/**
 * app configuration.
 */
var app = express.createServer();


app.configure(function(){

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));

	app.set('views', __dirname + '/views');

	// disable layout
	app.set("view options", { layout: false });

	// make a custom html template
	app.register('.html', {
		compile: function(str, options) {
		return function(locals) {
			return str;
		};
	}
	});
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

/**
 * Routing.
 */

// index
app.get('/', function(req, res) {
	res.render('index.html');
});


/**
 * app start
 */
app.listen(8080);

/**
 * log
 */
console.log("Express server listening on port %d", app.address().port);