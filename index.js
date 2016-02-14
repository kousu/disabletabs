
var tabs = require('sdk/tabs');
var windows = require('sdk/windows').browserWindows;
var notifications = require('sdk/notifications');
var privateBrowsing = require('sdk/private-browsing');

exports.main = function(){

	tabs.on('open', function(tab){
		// this is *not* triggered on opening a new window, only on opening a second tab in that window
		// which means that we can *assume* this code is running in an unwanted new tab
		
		// i. translate new tab -> new window
		windows.open(tab.url);
		
		// ii. cancel the new tab
		tab.close();
	});
	
};
