
var tabs = require('sdk/tabs');
var notifications = require('sdk/notifications');
var privateBrowsing = require('sdk/private-browsing');

exports.main = function(){

	tabs.on('open', function(tab){
		// this is *not* triggered on opening a new window, only on opening a second tab in that window
		tab.close();
		return;
	});
	
};
