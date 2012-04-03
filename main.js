var requirejs = require('requirejs');

/**
 * require configuration.
 */

requirejs.config({
    baseUrl: 'server',
    nodeRequire: require
});

requirejs([

	'controllers/app'

],

function(App) {

	new App();

});