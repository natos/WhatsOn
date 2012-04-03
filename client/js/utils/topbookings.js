$(function() {

	$.getJSON('http://tvgids.upc.nl/customerApi/wa/topBookings', function(data) {

		var render = $('#top-bookings'), title, description, channel, start, end,
			listItem = $('<li>');

		// iterate
		$(data).each(function(i, collection) {

			$(collection).each(function(e, item) {

				list = listItem.clone();

				start = prettyDate(item.startDateTime);
				title = $('<h2>' + item.programme.title + '</h2>').appendTo(list);
				description = $('<p>' + item.programme.shortDescription + '</p>').appendTo(list);
				channel = $('<p>on <strong>' + item.channel.name + '</strong>, ' + start + '</p>').appendTo(list);

				list.appendTo(render);
			});

		});

	});

});
