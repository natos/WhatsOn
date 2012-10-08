/* 
* Language utility
* --------
*
* Usage:
*
* var lang = new Language('nl');
*
* searchText = lang.translate('nav-label-search'); // 'Zoeken'
* var now = new Date('2012-10-08'); // Monday 8 October 2012
* weekdayName = lang.translate('day-' + now.getDay()); // 'Maandag'
*
*/

define([

	'config/language'

], function LanguageScope(allTranslations) {


	function LanguageConstructor(languageCode) {

		var translations = allTranslations[languageCode];

		var translate = function(key) {
			return translations[key] || key;
		};

		return {
			translate : translate
		};
	}

	return LanguageConstructor;

});