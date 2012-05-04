define([

], function() {

/* private */


/* User Config */

	var config = {

		// constants

		APP_ID: 290742221014129,

		SCOPE: 'email, user_interests, user_likes, user_location, friends_likes, publish_actions, user_activities, user_events, friends_events, friends_online_presence, read_friendlists, user_online_presence, status_update, publish_stream, share_item, create_event, rsvp_event',

		// events
	
		STARTED: 'user:started',
	
		STATUS_CHANGED: 'user:status_changed',
	
		// messages
	
		NOT_AUTHORIZED: 'user:not_authorized',
	
		NOT_LOGGED: 'user:not_logged',
	
		LOGGED: 'user:logged',

		// DOM Access

		$window: $(window),
	
		$body: $(document.body),

		$button: $('.login'),
	
		$userControl: $('#user-control')

	};

	return config;

});