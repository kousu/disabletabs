

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
const { modelFor } = require("sdk/model/core");
const { viewFor } = require("sdk/view/core");
const { getTabContainer } = require("sdk/tabs/utils");

//require("experiments/test-buttons.js");

function remove_tabbar(window) {
	// this gets the .tabbrowser-tabs element that is defined in chrome://browser/content/tabbrowser.xml
	var c = getTabContainer(viewFor(window));
	
	// And this axes the tabbar on it.
	//   I'm not totally sure why this works, since I'd expect this to hide the *entire* Window,
	//   since you'd think a tabcontainer would contain tabs, but apparently not.
	c.style.display = "none";
}


exports.main = function(){
	// run this on any windows open at boot, because the first windows
	// don't trigger the 'open' event, at least on Firefox 44.
	for(let w of windows) {
		remove_tabbar(w);
	}

	tabs.on('open', function(tab){
		// this is *not* triggered on opening a new window, only on opening a second tab in that window
		// which means that we can *assume* this code is running in an unwanted new tab
		
		// translate new tab -> new window
		viewFor(tab.window).gBrowser.replaceTabWithWindow(viewFor(tab));
	});
	
	windows.on('open', remove_tabbar);
	windows.on('activate', remove_tabbar); // this is defensive coding: sometimes the 'open' event doesn't trigger (e.g. clicking a developer's name in about:addons).
	                                       // these are bugs in the Firefox SDK, as far as I'm concerned, but I have to work around them. by catching 'activate' at least the bar will blip away quickly enough.
};




