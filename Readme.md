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

When the release has been packaged, it should be possible to run the app from
the file system by opening `index.html` in your browser.

## Running versions

* [upcsocial.herokuapp.com](http://upcsocial.herokuapp.com)
