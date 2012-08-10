# UPC What's On

## Run the app

	$ node main.js

## With nodemon

	$ nodemon main.js

## Run the app for a specific environment type

	$ NODE_ENV=production node main.js
	$ NODE_ENV=production nodemon main.js


## Minify & concatenate JS/CSS for for production use

	$ node node_modules/requirejs/bin/r.js -o client/js/app.build.js

It is not ideal to commit build assets into git. However, because of Heroku's read-only file system, the simplest way to deploy compiled assets is:

1. Run build step locally
2. git commit (with compiled assets)
3. git push heroku master


## Run the tests

	$ jasmine-node server
