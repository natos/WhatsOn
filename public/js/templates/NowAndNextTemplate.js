// NowAndNextTemplate.js

define([], function(){

var t = '<div id="nowandnext" class="view">'
	+ '<ul class="list">'
	+ '<% _.each(models, function( item ){ %>'
	+ '<li>'
	+ '<div class="logo"><img src="http://www.upc.nl<%= item.get("channel").logoIMG %>"></div>'
	+ '<h2><%= item.get("programme").title %></h2>'
	+ '<p><%= item.get("programme").shortDescription %></p>'
	+ '<p>on <strong><%= item.get("channel").name %></strong></p>'
	+ '<date><%= item.get("start") %></date>'
	+ '</li>'
	+ '<% }); %>'
	+ '</ul>'
	+ '</div>'

	return t;

});