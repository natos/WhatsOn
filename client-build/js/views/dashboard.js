define(["modules/app","lib/flaco/view","components/carousel","components/favorites"],function(a,b,c,d){function e(){return i=window.setInterval(function(){$("#on-now").load("/dashboard #on-now")},6e4),this}function f(){return this}function g(){return window.clearInterval(i),this}var h="dashboard",i;return new b({name:h,render:f,finalize:g,initialize:e,components:{carousel:c,favorites:d}})})