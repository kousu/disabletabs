var title = require('./package.json').title;
var { ActionButton } = require('sdk/ui/button/action');
var simplePrefs = require('sdk/simple-prefs');
var _ = require('sdk/l10n').get;
var windows = require('sdk/windows');
var tabs = require('sdk/tabs');
var notifications = require('sdk/notifications');
var { setTimeout } = require('sdk/timers');
var privateBrowsing = require('sdk/private-browsing');

exports.main = function(){
        console.log("disable tabs 0.1");
	tabs.on('open', function(tab){
		var window = tab.window;
		// setTimeout is needed because window.tabs.length value seems to update *slower*
		setTimeout(function(){
			if(window.tabs.length > 1) { tab.close(); }
		}, 1);
	});
};
