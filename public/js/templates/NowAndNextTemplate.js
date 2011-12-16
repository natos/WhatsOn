// NowAndNextTemplate.js

define([], function(){

var t = '<div id="nowandnext" class="view">'
	+ '<ul class="list">'
	+ '<% _.each(models, function( item ){ %>'
	+ '<li>'
	+ '<date><%= item.get("start") %></date>'
	+ '<div class="logo"><img src="http://www.upc.nl<%= item.get("channel").logoIMG %>" alt="<%= item.get("channel").name %>"></div>'
	+ '<h2><%= item.get("programme").title %></h2>'
	+ '<p><%= item.get("programme").shortDescription %></p>'
	+ '</li>'
	+ '<% }); %>'
	+ '</ul>'
	+ '</div>'

	return t;

});