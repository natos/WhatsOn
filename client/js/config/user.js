/* 
* UserConfig
* --------------
*
* Constants and configurations for User
*
*/

define([], function UserConfigContext() {

/* private */

/* public */

/* exports */

	return {

		/* constants */

		APP_ID: 290742221014129,

		SCOPE: 'email, user_interests, user_likes, user_location, friends_likes, publish_actions, user_activities, user_events, friends_events, friends_online_presence, read_friendlists, user_online_presence, status_update, publish_stream, share_item, create_event, rsvp_event',

		/* events */

		LOG_IN: 'user:log_in',

		LOG_OUT: 'user:log_out',

		LOGGED_IN: 'user:logged_in',

		LOGGED_OUT: 'user:logged_out',
	
		STATUS_CHANGED: 'user:status_changed',

		MODEL_CHANGED: 'user:model_changed',

		FETCH_FAVORITES: 'user:fetch_favorites',

		FETCH_RECORDINGS: 'user:fetch_recordings',
	
		/* message */

		NOT_AUTHORIZED: 'not_authorized',

		CONNECTED: 'connected',

		UNKNOWN: 'unknown',

		/* DOM Access */

		$window: $(window),
	
		$body: $(document.body),

		$loginButton: $('.login'),
	
		$userControl: $('.user-control')

	};

});