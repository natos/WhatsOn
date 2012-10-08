# Notes on zepto.js usage

The current version of zepto.js offered for download on zeptojs.com is 1.0rc1. The version in the download link includes the optional "touch" module. This module binds its own handlers to the touch[start|move|end|cancel] events on document load in order to provide support for virtual "swipe", "tap" (et al.) events.

Unfortunately, these event handlers can cause significant jank & juddering when scrolling through long pages on iOS 5 (test device: iPod Touch running iOS 5.1). Removing these bindings restores buttery smoothness to scrolling, but comes at the cost of losing zepto's virtual events.

So if you don't plan to use zepto's touch events, compile a version of zepto that *does not include the touch module*.

To compile a custom version of zepto, [download the source code from github](https://github.com/madrobby/zepto/tree/) and run the `rake` task:

	$ rake

Interestingly, in the current version of the source code, the default rake task does *not* include the touch module, even though the RC1 version on the web site does. To *ensure* that the touch module is not included, run the rake task with the instruction to explicitly exclude the touch module:

	$ rake concat[-touch] dist

