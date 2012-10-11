# UPC Whats On

## Run the app

	$ node main.js

## Run the app for a specific environment type

    $ NODE_ENV=production node main.js
    $ NODE_ENV=production nodemon main.js

## Prepare distribution for production use:

Using [grunt](http://gruntjs.com/) as a build/config tool.

Requirements: `grunt` (installed globally) and `grunt-contrib` 
(installed in the node_modules directory of the current project)

	$ npm install -g grunt
	$ npm install grunt-contrib

For development, CSS and JS files are separated. For production use, they are
concatenated and minified. To prepare a release:

	$ grunt release

This creates a date-stamped release folder: `/release/:dt/` with the project 
inside it.


## Minify & concatenate JS/CSS for for production use

If r.js is installed in the project `node_modules` directory:

    $ node node_modules/requirejs/bin/r.js -o client/js/app.build.js

It is not ideal to commit build assets into git. However, because of Heroku's read-only file system, the simplest way to deploy compiled assets is:

1. Run build step locally
2. git commit (with compiled assets)
3. git push heroku master

## Run the tests

    $ jasmine-node server

## Running versions

* [upcsocial.herokuapp.com](http://upcsocial.herokuapp.com)
