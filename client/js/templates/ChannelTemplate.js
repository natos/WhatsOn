// ChannelTemplate.js

define([], function(){

var t = '<div id="channel" class="view">'
	+ '<div class="logo"><img src="http://www.upc.nl<%= logoIMG %>"></div>'
	+ '<h2><%= name %></h2>'
	+ '<p>on <strong><%= position %></strong>, <%= description %></p>'
	+ '<div id="events"><img src="assets/loader.gif"><div>'
	+ '</div>'

	return t;

});