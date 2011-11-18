// AllChannelsTemplate.js

define([], function(){

var t = '<div id="allchannels" class="view">'
	+ '<ul class="list">'
	+ '<% _.each(models, function( item ){ %>'
	+ '<li>'
	+ '<h2><%= item.get("name") %></h2>'
	+ '<p>on <strong><%= item.get("position") %></strong>, <%= item.get("description") %></p>'
	+ '</li>'
	+ '<% }); %>'
	+ '</ul>'
	+ '</div>'

	return t;

});