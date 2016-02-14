

var tabs = require('sdk/tabs');
var windows = require('sdk/windows').browserWindows;
var notifications = require('sdk/notifications');
var privateBrowsing = require('sdk/private-browsing');

// these translate between the chrome (aka XUL) elements and the internal objects
// the chrome elements are /views/ of the internal /model/ objects
// this means they have CSS attached but not data
// So if you want to fiddle with the look, you need to use the view
// Most of the high level SDK deals with the model
// hacking the view is considered the low-level API
// and apparently, things named 'utils' are the views...
//// ALSO, this syntax is non-standard Javascript: it's a Mozilla extension which gives flexible destructuring: what this means is "assign to modelFor in the localnamespace the value of require("sdk/model/core").modelFor"
//// and you can say `var {a,  b,  c} ` to extract multiples
var { modelFor } = require("sdk/model/core");
var { viewFor } = require("sdk/view/core");
var { getTabContainer } = require("sdk/tabs/utils");

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
	windows.on('open', function(window) {
		console.error("opened window");
		console.error(window);
		var c = getTabContainer(viewFor(window)); // this gets the .tabbrowser-tabs element that is defined in chrome://browser/content/tabbrowser.xml
		c.style.display = "none"; // I'm not totally sure why this works, since I'd expect this to hide the *entire* Window, since you'd think a tabcontainer would contain tabs, but apparently tabs only mean the headers you click to switch the current view.
	});

};
