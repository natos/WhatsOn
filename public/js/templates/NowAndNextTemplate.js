// NowAndNextTemplate.js

define([], function(){

var t = '<div id="nowandnext" class="view">'
	+ '<ul class="list">'
	+ '<% _.each(models, function( item ){ %>'
	+ '<li>'
	+ '<h2><%= item.get("programme").title %></h2>'
	+ '<p><%= item.get("programme").shortDescription %></p>'
	+ '<p>on <strong><%= item.get("channel").name %></strong>, <date><%= item.get("start") %></date></p>'
	+ '</li>'
	+ '<% }); %>'
	+ '</ul>'
	+ '</div>'

	return t;

});