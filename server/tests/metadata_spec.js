var requirejs = require('requirejs');

/**
 * require configuration.
 */

requirejs.config({
    baseUrl: 'server',
    nodeRequire: require
});

requirejs([

	'config/global.config'
,	'utils/metadata'
,	'utils/list'

],

function(config, Metadata, List) {

	var	rawMetadata = new Metadata();

	var metadata = new Metadata();

	describe("Metadata sanity check", function() {

		describe("Metadata sanity check", function() {

			it('should have valid TITLE metadata for the open graph', function() {

				expect( metadata.get('og:title') ).toEqual( { property: 'og:title', content: config.APP_NAME } );

				expect( metadata.get('og:title').content ).toEqual( config.APP_NAME );

			});

			it('should have valid SITE_NAME metadata for the open graph', function() {

				expect( metadata.get('og:site_name') ).toEqual( { property: 'og:site_name', content: config.APP_NAME } );

				expect( metadata.get('og:site_name').content ).toEqual( config.APP_NAME );

			});


			it('should have valid TYPE metadata for the open graph', function() {

				expect( metadata.get('og:type') ).toEqual( { property: 'og:type', content: 'app' } );

				expect( metadata.get('og:type').content ).toEqual( 'app' );

			});

			it('should have valid URL metadata for the open graph', function() {

				expect( metadata.get('og:url') ).toEqual( { property: 'og:url', content: config.APP_URL } );

				expect( metadata.get('og:url').content ).toEqual( config.APP_URL );

			});

			it('should have valid APP_ID metadata for the open graph', function() {

				expect( metadata.get('fb:app_id') ).toEqual( { property: 'fb:app_id', content: config.facebook['app-id'] } );

				expect( metadata.get('fb:app_id').content ).toEqual( config.facebook['app-id'] );

			});

		});	// End Metadata sanity check

		describe("Metadata basic behaviors", function() {


			it('should add new new tag to the collection and be different to the original collection', function() {

				metadata.add({ property: 'author', content: 'Natan' })

				expect( metadata.get() ).not.toEqual( rawMetadata.get() );

			});

		});

	});

});