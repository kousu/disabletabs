
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
	
	// next step: can I edit the XUL stylesheet from here?
	// answer: according to https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/XUL_Migration_Guide, yes:
	// "by using the SDK's low-level APIs you can directly modify the browser chrome."
	// see  https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs
	/// ... but I can't figure this out
	windows.on('open', function(window) {
		console.error("opened window");
		console.error(window);
	});

// snipped from https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/XUL_Migration_Guide#Modifying_the_Browser_Chrome and hacked
function removeForwardButton() {
  var window = require("sdk/window/utils").getMostRecentBrowserWindow();
  var forward = window.document.getElementById('back-button');
  var parent = window.document.getElementById('urlbar-container');
  forward.style['background-color'] = "red"; //hah hah hah wooo
//  parent.removeChild(forward);
}

require("sdk/ui/button/action").ActionButton({
  id: "remove-forward-button",
  label: "Remove Forward Button",
  icon: "./icon-16.png",
  onClick: removeForwardButton
});
};
