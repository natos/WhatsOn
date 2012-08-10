define(["config/user","config/channel","modules/app","models/user","models/channel","components/user"],function(a,b,c,d,e,f){function g(b){d.set(FACEBOOK_STATUS,b);switch(b.status){case a.CONNECTED:h();break;case a.NOT_AUTHORIZED:case a.UNKNOWN:i()}}function h(){n(),o(),c.emit(a.LOGGED_IN)}function i(){c.emit(a.LOGGED_OUT),d.set(FACEBOOK_STATUS,!1),d.set(FAVORITES,!1),d.set(FAVORITE_PROGRAMMES,!1),d.set(FAVORITE_CHANNELS,!1),e[b.GROUPS]["001"].length=0}function j(){function b(a){if(a&&a.error){console.log("Error on UserModule","Can't login",a);return}typeof d=="function"&&d(c)}var c=w.call(arguments,0),d=c.shift();FB.login(b,{scope:a.SCOPE})}function k(){FB.logout(function(a){})}function l(){return d[FACEBOOK_STATUS]?!0:!1}function m(a){function b(a){return g=a,{saveTo:c}}function c(a){return h=a,{process:d}}function d(a){i=a,f&&g&&h&&FB.api(g,e)}function e(a){if(!a){console.log("Warning!",f,g,h.name,": Open graph has sent an empty response",a);return}if(i){i({label:f,call:g,model:h,callback:i,response:a});return}h.set(f,a)}var f=a,g,h,i;return{from:b}}function n(){m(LIKES).from(LIKES_CALL).saveTo(d).process()}function o(){m(FAVORITES).from(FAVORITES_CALL).saveTo(d).process(function(a){a.model.set(a.label,a.response);var c="tv_show",d="tv_channel",f={},g={},h;a.response.data.forEach(function(a){c in a.data&&a.data[c].url&&(f[a.data[c].url]=a),d in a.data&&a.data[d].url&&(g[a.data[d].url]=a,h=a.data[d].url.split("http://upcsocial.herokuapp.com/channel/")[1],e[b.GROUPS]["001"].push(e[b.BY_ID][h]))}),a.model.set(FAVORITE_PROGRAMMES,f),a.model.set(FAVORITE_CHANNELS,g)})}function p(){m(RECORDINGS).from(RECORDINGS_CALL).saveTo(d).process()}function q(a){if(!l()){j(function(){q(a)});return}FB.ui(a,function(a){if(!a||a.error){console.log("Error occured trying to share on the wall",a);return}console.log("Shared",a)})}function r(a,b){if(!l()){j(function(){r(a,b)});return}a=a.split("upcsocial:").join("");var c={};c[a]=b,FB.api("/me/upcsocial:favorite","post",c,function(a){if(!a||a.error){console.log("Error occured trying to add a new favorite",a);return}console.log("Favorite was added",a),o()})}function s(a){if(!l()){j(function(){s(a)});return}FB.api(a,"delete",function(a){if(!a||a.error){console.log("Error occured trying to remove favorite",a);return}console.log("Favorite was deleted"),o()})}function t(){if(typeof FB=="undefined"){console.log("User: waiting for facebook SDK"),require(["http://connect.facebook.net/en_US/all.js"],function(){t(),console.log("User: facebook SDK ready!")});return}return FB.Event.subscribe(AUTH_STATUS_CHANGE,g),FB.init({appId:a.APP_ID,status:!0,cookie:!0,xfbml:!0}),this.components={user:f.initialize()},c.on(a.LOG_IN,j),c.on(a.LOG_OUT,k),c.on(a.FETCH_LIKES,n),c.on(a.FETCH_FAVORITES,o),c.on(a.FETCH_RECORDINGS,p),c.on(a.SHARE,q),c.on(a.ADD_FAVORITE,r),c.on(a.REMOVE_FAVORITE,s),this}function u(){return FB.Event.unsubscribe(AUTH_STATUS_CHANGE,g),c.off(a.LOG_IN,j),c.off(a.LOG_OUT,k),c.off(a.FETCH_LIKES,n),c.off(a.FETCH_FAVORITES,o),c.off(a.FETCH_RECORDINGS,p),c.off(a.SHARE,q),c.off(a.ADD_FAVORITE,r),c.off(a.REMOVE_FAVORITE,s),this.components.user=f.finalize(),this}var v="user",w=Array.prototype.slice;return FACEBOOK_STATUS="facebook-status",AUTH_STATUS_CHANGE="auth.statusChange",OPEN_GRAPH_PREFIX="/me/upcsocial:",LIKES_CALL="/me/likes",FAVORITES_CALL=OPEN_GRAPH_PREFIX+"favorite",RECORDINGS_CALL=OPEN_GRAPH_PREFIX+"record",LIKES="likes",FAVORITES="favorites",RECORDINGS="recordings",FAVORITE_PROGRAMMES="favorite-programmes",FAVORITE_CHANNELS="favorite-channels",{name:v,initialize:t,model:d}})