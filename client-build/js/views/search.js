define(["config/app","modules/app","lib/flaco/view","modules/router"],function(a,b,c,d){function e(a){a.stopPropagation();var b=a.target,c=$(b).attr("checked"),d=$(b).parents("li").attr("class"),e=b.value;if(!d||!e)return;n[d][e]=c,g()}function f(a){var b=!0;for(var c in n[a])n[a][c]&&(b=!1);return b}function g(){var a=$("#search-results"),b=f("channel"),c=f("datetime");if(b&&c){a.find("li").show();return}a.find("li").hide(),a.find("li").each(function(a,d){var e=$(d);$programme=e.parents(".programme"),b?n.datetime[e.data("datetime")]&&($programme.show(),e.show()):c?n.channel[e.data("channel")]&&($programme.show(),e.show()):n.channel[e.data("channel")]&&n.datetime[e.data("datetime")]&&($programme.show(),e.show())})}function h(){var a=$("#filters");a.find("input").each(function(a,b){var c=$(b).parents("li").attr("class"),d=b.value;n[c]||(n[c]={}),n[c][d]=!1})}function i(a){return $("#content").load("/search?q="+$("#q").val(),function(a,b,c){}),!1}function j(){return a._win.addEventListener("click",e,!1),a._win.addEventListener("change",e,!1),a._win.addEventListener("submit",i),this}function k(){return h(),this}function l(){return a._win.removeEventListener("click",e,!1),a._win.removeEventListener("change",e,!1),a._win.removeEventListener("submit",i,!1),this}var m="search",n={};return new c({name:m,initialize:j,finalize:l,render:k,filters:n})})