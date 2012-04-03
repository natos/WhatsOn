// ChannelEventsTemplate.js

define([], function(){

var t = '<ul class="list">'
	+ '<% _.each(models, function( item ){ %>'
	+ '<li id="<%= item.get("id") %>">'
	+ '<h3><a href="#programme/<%= item.get("programme").id %>"><%= item.get("programme").title %></a></h3>'
	+ 'From <%= item.get("startDateTime") %> to <%= item.get("endDateTime") %> </p>'
	+ '<%= item.get("programme").shortDescription %></p>'
	+ '</li>'
	+ '<% }); %>'
	+ '</ul>'

	return t;

});