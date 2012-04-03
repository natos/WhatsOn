// AllChannelsTemplate.js

define([], function(){

var t = '<div id="channel" class="view">'
	+ '<ul class="list">'
	+ '<% _.each(models, function( item ){ %>'
	+ '<li id="<%= item.get("id") %>">'
	+ '<div class="logo"><a href="#channel/<%= item.get("id") %>"><img src="http://www.upc.nl<%= item.get("logoIMG") %>"></a></div>'
	+ '<h2><a href="#channel/<%= item.get("id") %>"><%= item.get("name") %></a></h2>'
	+ '<p>on <strong><%= item.get("position") %></strong>, <%= item.get("description") %></p>'
	+ '</li>'
	+ '<% }); %>'
	+ '</ul>'
	+ '</div>'

	return t;

});